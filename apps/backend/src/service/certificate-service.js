import { DEFAULT_CACHE_TTL } from "@heykyy/constant";

import { getPrisma } from "../application/database.js";
import {
  CertificateDto,
  CertificateListDto,
} from "../dtos/certificate-dtos.js";
import { redis } from "../lib/redis.js";
import { supabase } from "../lib/supabase.js";
import { ApiError, AssetUtils, PaginationUtils } from "../utils/index.js";
import {
  createCertificateSchema,
  updateCertificateSchema,
} from "../validation/certificate-validations.js";
import { validate } from "../validation/validation.js";

/**
 * Service class for managing Professional Certificates.
 * Implements dual-asset management via Supabase with selective database updates.
 */
class CertificateService {
  /**
   * Provides access to the Prisma ORM client instance.
   * @returns {import("@prisma/client").PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Internal utility to flush all paginated certificate list caches from Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearCertificateCaches() {
    try {
      const keys = await redis.keys("certificates:list:*");
      if (keys.length > 0) await redis.del(...keys);
    } catch (err) {}
  }

  /**
   * Defines the standard database selection structure for certificate queries.
   * @private
   * @returns {Object}
   */
  get #certificateSelect() {
    return {
      id: true,
      title: true,
      summary: true,
      issuer: true,
      year: true,
      file: { select: { url: true } },
      image: { select: { url: true } },
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Handles physical file upload and database asset creation with dynamic pathing.
   * @private
   * @param {Object} file - The file object to be uploaded.
   * @returns {Promise<{asset: Object, path: string}>}
   * @throws {ApiError} If the asset processing fails.
   */
  async #processAndCreateAsset(file) {
    try {
      const isImage = file.mimeType.startsWith("image/");
      const targetFolder = isImage
        ? "certificates/images"
        : "certificates/docs";

      const uploaded = await AssetUtils.createAsset(
        supabase,
        file,
        targetFolder
      );
      const asset = await this.prisma.asset.create({ data: { ...uploaded } });
      return { asset, path: uploaded.storagePath };
    } catch (err) {
      throw new ApiError(
        500,
        "An error occurred while processing the certificate file. Please verify the file format and try again."
      );
    }
  }

  /**
   * Securely removes an asset from cloud storage and database.
   * @private
   * @param {string} assetId - The unique ID of the asset.
   * @param {string} storagePath - The file path in cloud storage.
   * @returns {Promise<void>}
   */
  async #destroyAsset(assetId, storagePath) {
    if (!assetId || !storagePath) return;
    await AssetUtils.deleteAsset(supabase, storagePath).catch(() => {});
    await this.prisma.asset.delete({ where: { id: assetId } }).catch(() => {});
  }

  /**
   * Creates a new certificate entry with categorized asset storage.
   * @param {string} userId - Author ID.
   * @param {Object} request - Certificate details.
   * @param {Object} [image] - Optional preview image.
   * @param {Object} file - Required certificate document.
   * @returns {Promise<CertificateDto>}
   */
  async create(userId, request, image, file) {
    const trackedPaths = [];
    const trackedAssetIds = [];

    try {
      const payload = validate(createCertificateSchema, request);
      if (!file) {
        throw new ApiError(
          400,
          "A certificate document is required to proceed with the creation."
        );
      }

      let imageId = null;
      let fileId = null;

      if (image) {
        const { asset, path } = await this.#processAndCreateAsset(image);
        trackedPaths.push(path);
        trackedAssetIds.push(asset.id);
        imageId = asset.id;
      }

      if (file) {
        const { asset, path } = await this.#processAndCreateAsset(file);
        trackedPaths.push(path);
        trackedAssetIds.push(asset.id);
        fileId = asset.id;
      }

      const certificate = await this.prisma.certificate.create({
        data: { ...payload, userId, imageId, fileId },
        select: this.#certificateSelect,
      });

      await this.#clearCertificateCaches();
      return new CertificateDto(certificate);
    } catch (err) {
      for (const path of trackedPaths)
        await AssetUtils.deleteAsset(supabase, path).catch(() => {});
      for (const id of trackedAssetIds)
        await this.prisma.asset.delete({ where: { id } }).catch(() => {});

      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        "Failed to create the certificate record due to a server error."
      );
    }
  }

  /**
   * Updates certificate selectively and manages old asset replacement.
   * @param {string} id - Certificate UUID.
   * @param {Object} request - Update payload.
   * @param {Object} [image] - New preview image.
   * @param {Object} [file] - New document file.
   * @returns {Promise<CertificateDto>}
   */
  async update(id, request, image, file) {
    const trackedPaths = [];
    const trackedAssetIds = [];

    const existing = await this.prisma.certificate.findUnique({
      where: { id },
      select: {
        title: true,
        summary: true,
        issuer: true,
        year: true,
        image: { select: { id: true, storagePath: true } },
        file: { select: { id: true, storagePath: true } },
      },
    });

    if (!existing) {
      throw new ApiError(
        404,
        "The certificate requested for update was not found."
      );
    }

    const payload = validate(updateCertificateSchema, request);
    const updateData = {};

    const fields = ["title", "summary", "issuer", "year"];
    fields.forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== existing[field]) {
        updateData[field] = payload[field];
      }
    });

    try {
      if (image) {
        const { asset, path } = await this.#processAndCreateAsset(image);
        trackedPaths.push(path);
        trackedAssetIds.push(asset.id);
        updateData.imageId = asset.id;
      }

      if (file) {
        const { asset, path } = await this.#processAndCreateAsset(file);
        trackedPaths.push(path);
        trackedAssetIds.push(asset.id);
        updateData.fileId = asset.id;
      }

      if (Object.keys(updateData).length === 0) {
        return this.get(id);
      }

      const updated = await this.prisma.certificate.update({
        where: { id },
        data: updateData,
        select: this.#certificateSelect,
      });

      if (image && existing.image) {
        await this.#destroyAsset(existing.image.id, existing.image.storagePath);
      }

      if (file && existing.file) {
        await this.#destroyAsset(existing.file.id, existing.file.storagePath);
      }

      await redis.del(`certificates:detail:${id}`);
      await this.#clearCertificateCaches();
      return new CertificateDto(updated);
    } catch (err) {
      for (const path of trackedPaths)
        await AssetUtils.deleteAsset(supabase, path).catch(() => {});
      for (const id of trackedAssetIds)
        await this.prisma.asset.delete({ where: { id } }).catch(() => {});

      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        "An error occurred while updating the certificate."
      );
    }
  }

  /**
   * Deletes a certificate and performs full cleanup of associated assets.
   * @param {string} id - Certificate UUID.
   * @returns {Promise<void>}
   */
  async delete(id) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      select: {
        image: { select: { id: true, storagePath: true } },
        file: { select: { id: true, storagePath: true } },
      },
    });

    if (!certificate) {
      throw new ApiError(
        404,
        "Certificate not found. It may have already been deleted."
      );
    }

    if (certificate.image) {
      await this.#destroyAsset(
        certificate.image.id,
        certificate.image.storagePath
      );
    }
    if (certificate.file) {
      await this.#destroyAsset(
        certificate.file.id,
        certificate.file.storagePath
      );
    }

    await this.prisma.certificate.delete({ where: { id } });

    await redis.del(`certificates:detail:${id}`);
    await this.#clearCertificateCaches();
  }

  /**
   * Retrieves certificate details with caching.
   * @param {string} id - Certificate UUID.
   * @returns {Promise<CertificateDto>}
   */
  async get(id) {
    const cacheKey = `certificates:detail:${id}`;

    try {
      let cached = await redis.get(cacheKey);
      if (cached) {
        return new CertificateDto(
          typeof cached === "string" ? JSON.parse(cached) : cached
        );
      }

      const certificate = await this.prisma.certificate.findUnique({
        where: { id },
        select: this.#certificateSelect,
      });

      if (!certificate) {
        throw new ApiError(
          404,
          "The requested certificate details are unavailable."
        );
      }

      await redis.set(cacheKey, JSON.stringify(certificate), {
        ex: DEFAULT_CACHE_TTL,
      });
      return new CertificateDto(certificate);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Failed to retrieve certificate details.");
    }
  }

  /**
   * Fetches a paginated and searchable list of certificates.
   * @param {number} page - Current page.
   * @param {number} limit - Items per page.
   * @param {string} [search] - Keyword search.
   * @param {string} [year] - Year filter.
   * @param {string} [sortBy="year_desc"] - Sorting rule.
   * @returns {Promise<Object>}
   */
  async gets(page, limit, search, year, sortBy = "year_desc") {
    const cacheKey = `certificates:list:${page}:${limit}:${search || ""}:${
      year || ""
    }:${sortBy}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached)
        return typeof cached === "string" ? JSON.parse(cached) : cached;

      const { skip, limit: take } = PaginationUtils.create({ page, limit });

      const where = {
        ...(year && { year: parseInt(year) }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { issuer: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const orderMapping = {
        year_desc: { year: "desc" },
        year_asc: { year: "asc" },
        latest_added: { createdAt: "desc" },
      };

      const [total, items] = await Promise.all([
        this.prisma.certificate.count({ where }),
        this.prisma.certificate.findMany({
          where,
          skip,
          take,
          orderBy: orderMapping[sortBy] || orderMapping.year_desc,
          select: this.#certificateSelect,
        }),
      ]);

      const result = {
        data: new CertificateListDto(items).items,
        metadata: PaginationUtils.generateMetadata(total, page, take),
      };

      await redis.set(cacheKey, JSON.stringify(result), {
        ex: DEFAULT_CACHE_TTL,
      });
      return result;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, "Could not load the certificate list.");
    }
  }
}

export default new CertificateService();