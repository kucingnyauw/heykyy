import { getPrisma } from "../application/database.js";
import { validate } from "../validation/validation.js";
import {
  createCVSchema,
  updateCVSchema,
} from "../validation/cv-validations.js";
import { ApiError, PaginationUtils, AssetUtils } from "@heykyy/utils-backend";
import { CvDto, CvListDto } from "../dtos/cvs-dtos.js";
import { supabase } from "../lib/supabase.js";
import { redis } from "../lib/redis.js";

/**
 * Service class for managing CV (Curriculum Vitae) lifecycle.
 * Handles file uploads to Supabase, atomic primary CV flag management, and Redis caching.
 */
class CvService {
  /**
   * Provides access to the Prisma ORM client instance.
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Internal helper to invalidate all CV-related caches in Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearCvCaches() {
    try {
      const keys = await redis.keys("cvs:list:*");
      if (keys.length > 0) await redis.del(...keys);
      await redis.del("cvs:main");
    } catch (err) {
      /** Cache invalidation errors are suppressed to maintain service availability */
    }
  }

  /**
   * Defines the standard database selection structure for CV records.
   * @private
   * @returns {Object}
   */
  get #cvSelect() {
    return {
      id: true,
      title: true,
      isMain: true,
      file: { select: { url: true } },
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Handles physical file upload to cloud storage and creates a corresponding asset record.
   * @param {Object} file - The file object from the multipart request.
   * @returns {Promise<{assetId: string, path: string}>} The database asset ID and cloud storage path.
   * @throws {ApiError} If the storage upload or asset creation fails.
   */
  async uploadFile(file) {
    try {
      /** Standardized path for CV documents */
      const uploaded = await AssetUtils.createAsset(
        supabase,
        file,
        "uploads/docs/cvs"
      );
      const asset = await this.prisma.asset.create({ data: uploaded });
      return { assetId: asset.id, path: uploaded.storagePath };
    } catch (err) {
      throw new ApiError(
        500,
        "The system could not process your CV file. Please verify it is a valid PDF and try again."
      );
    }
  }

  /**
   * Registers a new CV and optionally sets it as the primary (main) CV.
   * @param {string} userId - ID of the user owning the CV.
   * @param {Object} request - The validated CV data.
   * @param {Object} file - The PDF document file.
   * @returns {Promise<CvDto>}
   * @throws {ApiError} If the file is missing or database transaction fails.
   */
  async create(userId, request, file) {
    let tempPath, assetId;

    try {
      const payload = validate(createCVSchema, request);

      if (!file) {
        throw new ApiError(
          400,
          "A document file is required to create a CV record. Please provide a PDF file."
        );
      }

      const upload = await this.uploadFile(file);
      tempPath = upload.path;
      assetId = upload.assetId;

      const cv = await this.prisma.$transaction(async (tx) => {
        if (payload.isMain) {
          await tx.cV.updateMany({
            where: { userId, isMain: true },
            data: { isMain: false },
          });
        }

        return tx.cV.create({
          data: {
            title: payload.title,
            isMain: payload.isMain,
            fileId: assetId,
            userId,
          },
          select: this.#cvSelect,
        });
      });

      await this.#clearCvCaches();
      return new CvDto(cv);
    } catch (err) {
      /** Clean up orphaned files if the process fails */
      if (tempPath) {
        await AssetUtils.deleteAsset(supabase, tempPath).catch(() => {});
      }
      if (assetId) {
        await this.prisma.asset
          .delete({ where: { id: assetId } })
          .catch(() => {});
      }

      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        "An unexpected error occurred while saving the CV. Please try again later."
      );
    }
  }

  /**
   * Updates an existing CV record. Only updates modified fields or replaces files if provided.
   * @param {string} id - Unique identifier of the CV.
   * @param {Object} request - The fields to update.
   * @param {Object} [file] - Optional new PDF document file.
   * @returns {Promise<CvDto>}
   */
  async update(id, request, file) {
    let tempPath, assetId;

    const existing = await this.prisma.cV.findUnique({
      where: { id },
      select: {
        title: true,
        isMain: true,
        userId: true,
        file: { select: { id: true, storagePath: true } },
      },
    });

    if (!existing) {
      throw new ApiError(
        404,
        "The CV record you are trying to update could not be found."
      );
    }

    const payload = validate(updateCVSchema, request);
    const updateData = {};

    if (payload.title !== undefined && payload.title !== existing.title) {
      updateData.title = payload.title;
    }

    if (payload.isMain !== undefined && payload.isMain !== existing.isMain) {
      updateData.isMain = payload.isMain;
    }

    try {
      if (file) {
        const upload = await this.uploadFile(file);
        tempPath = upload.path;
        assetId = upload.assetId;
        updateData.fileId = assetId;
      }

      if (Object.keys(updateData).length === 0) {
        return this.getMain();
      }

      const updated = await this.prisma.$transaction(async (tx) => {
        if (updateData.isMain === true) {
          await tx.cV.updateMany({
            where: { userId: existing.userId, isMain: true, NOT: { id } },
            data: { isMain: false },
          });
        }

        return tx.cV.update({
          where: { id },
          data: updateData,
          select: this.#cvSelect,
        });
      });

      if (file && existing.file) {
        await AssetUtils.deleteAsset(supabase, existing.file.storagePath).catch(
          () => {}
        );
        await this.prisma.asset
          .delete({ where: { id: existing.file.id } })
          .catch(() => {});
      }

      await this.#clearCvCaches();
      return new CvDto(updated);
    } catch (err) {
      if (tempPath) {
        await AssetUtils.deleteAsset(supabase, tempPath).catch(() => {});
      }
      if (assetId) {
        await this.prisma.asset
          .delete({ where: { id: assetId } })
          .catch(() => {});
      }

      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        "Update failed due to a server error. Please verify your data and try again."
      );
    }
  }

  /**
   * Deletes a CV record and removes its associated file from cloud storage.
   * @param {string} id - Unique identifier of the CV to delete.
   * @returns {Promise<void>}
   */
  async delete(id) {
    const cv = await this.prisma.cV.findUnique({
      where: { id },
      select: { file: { select: { id: true, storagePath: true } } },
    });

    if (!cv) {
      throw new ApiError(404, "The specified CV record does not exist.");
    }

    try {
      if (cv.file) {
        await AssetUtils.deleteAsset(supabase, cv.file.storagePath).catch(
          () => {}
        );
        await this.prisma.asset
          .delete({ where: { id: cv.file.id } })
          .catch(() => {});
      }

      await this.prisma.cV.delete({ where: { id } });
      await this.#clearCvCaches();
    } catch (err) {
      throw new ApiError(
        500,
        "Could not delete the CV. Please ensure you have the necessary permissions."
      );
    }
  }

  /**
   * Retrieves a paginated list of CVs, with optional search filtering by title.
   * @param {number} page - Current page.
   * @param {number} limit - Items per page.
   * @param {string} [search] - Keyword filter for the title.
   * @param {boolean} [isMain] - Filter by primary status.
   * @returns {Promise<Object>}
   */
  async gets(page, limit, search, isMain) {
    const cacheKey = `cvs:list:${page}:${limit}:${search || ""}:${
      isMain || ""
    }`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached)
        return typeof cached === "string" ? JSON.parse(cached) : cached;

      const { skip, limit: take } = PaginationUtils.create({ page, limit });

      const where = {
        ...(isMain !== undefined && {
          isMain: isMain === "true" || isMain === true,
        }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
      };

      const [total, cvs] = await Promise.all([
        this.prisma.cV.count({ where }),
        this.prisma.cV.findMany({
          where,
          skip,
          take,
          orderBy: [{ isMain: "desc" }, { createdAt: "desc" }],
          select: this.#cvSelect,
        }),
      ]);

      const result = {
        data: new CvListDto(cvs).items,
        metadata: PaginationUtils.generateMetadata(total, page, take),
      };

      await redis.set(cacheKey, JSON.stringify(result), { ex: 86400 });
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        500,
        "Failed to retrieve the CV list from the database."
      );
    }
  }

  /**
   * Retrieves the CV currently marked as primary (Main).
   * @returns {Promise<CvDto>}
   * @throws {ApiError} 404 if no primary CV is set.
   */
  async getMain() {
    const cacheKey = "cvs:main";

    try {
      let cached = await redis.get(cacheKey);
      if (cached) {
        return new CvDto(
          typeof cached === "string" ? JSON.parse(cached) : cached
        );
      }

      const cv = await this.prisma.cV.findFirst({
        where: { isMain: true },
        orderBy: { createdAt: "desc" },
        select: this.#cvSelect,
      });

      if (!cv) {
        throw new ApiError(
          404,
          "No primary CV has been found. Please designate a main CV in your profile."
        );
      }

      await redis.set(cacheKey, JSON.stringify(cv), { ex: 86400 });
      return new CvDto(cv);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        "An error occurred while fetching the designated primary CV."
      );
    }
  }
}

export default new CvService();
