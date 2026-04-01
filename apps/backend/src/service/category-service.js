import { PaginationUtils, ApiError, AssetUtils } from "@heykyy/utils-backend";
import { getPrisma } from "../application/database.js";
import { validate } from "../validation/validation.js";
import { createCategorySchema } from "../validation/category-validations.js";
import { CategoryDto, CategoryListDto } from "../dtos/category-dtos.js";
import { redis } from "../lib/redis.js";
import { supabase } from "../lib/supabase.js";

/**
 * Service class for managing category operations including creation,
 * updates, deletion, and cross-entity cache management.
 */
class CategoryService {
  /**
   * Provides access to the Prisma client instance.
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Clears category-related cache keys from Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearCategoryCaches() {
    try {
      const keys = await redis.keys("categories:list:*");
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (err) {
      // Internal error tracking
    }
  }

  /**
   * Clears project-related cache keys from Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearProjectCaches() {
    try {
      const keys = await redis.keys("projects:list:*");
      if (keys.length > 0) await redis.del(...keys);
      await redis.del("projects:featured");
    } catch (err) {
      // Internal error tracking
    }
  }

  /**
   * Clears blog-related cache keys from Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearBlogCaches() {
    try {
      const keys = await redis.keys("blogs:list:*");
      if (keys.length > 0) await redis.del(...keys);
      await redis.del("blogs:featured");
    } catch (err) {
      // Internal error tracking
    }
  }

  /**
   * Returns the select configuration for category queries.
   * @private
   */
  get #categorySelect() {
    return {
      id: true,
      name: true,
      type: true,

      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Creates a new category.
   * * @param {Object} request - The category creation payload
   * @returns {Promise<CategoryDto>} The created category data
   * @throws {ApiError} 400 if category exists, 500 if database fails
   */
  async create(request) {
    const payload = validate(createCategorySchema, request);

    const exists = await this.prisma.category.count({
      where: { name: payload.name, type: payload.type },
    });

    if (exists) {
      throw new ApiError(
        400,
        `A category named "${payload.name}" with the type "${payload.type}" already exists. Please choose a different name or type.`
      );
    }

    try {
      const category = await this.prisma.category.create({
        data: {
          name: payload.name,
          type: payload.type,
        },
        select: this.#categorySelect,
      });

      await this.#clearCategoryCaches();
      return new CategoryDto(category);
    } catch (err) {
      throw new ApiError(
        500,
        "We encountered a problem while saving the new category. Please try again in a few moments."
      );
    }
  }

  /**
   * Updates an existing category's details.
   * * @param {string} id - The ID of the category to update
   * @param {Object} request - The update payload (name, type)
   * @returns {Promise<CategoryDto>} The updated category data
   * @throws {ApiError} 404 if not found, 400 if name/type conflict exists
   */
  async update(id, request) {
    const oldCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!oldCategory) {
      throw new ApiError(
        404,
        "The category you are trying to update could not be found. It may have been deleted."
      );
    }

    const updateData = {};

    if (request.name && request.name !== oldCategory.name) {
      updateData.name = request.name;
    }

    if (request.type && request.type !== oldCategory.type) {
      updateData.type = request.type;
    }

    if (Object.keys(updateData).length === 0) {
      return new CategoryDto(oldCategory);
    }

    const finalName = updateData.name ?? oldCategory.name;
    const finalType = updateData.type ?? oldCategory.type;

    const duplicate = await this.prisma.category.findFirst({
      where: {
        name: finalName,
        type: finalType,
        NOT: { id },
      },
    });

    if (duplicate) {
      throw new ApiError(
        400,
        `Update conflicted: A category with the name "${finalName}" and type "${finalType}" already exists. Please use unique values.`
      );
    }

    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data: updateData,
        select: this.#categorySelect,
      });

      await this.#clearCategoryCaches();
      return new CategoryDto(updated);
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while updating the category details. Please refresh and try again."
      );
    }
  }

  /**
   * Deletes a category and all associated blogs, projects, and their assets.
   * * @param {string} id - The ID of the category to delete
   * @returns {Promise<void>}
   * @throws {ApiError} 404 if not found, 500 if deletion fails
   */
  async delete(id) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        blogs: {
          include: { thumbnail: true, audio: true },
        },
        projects: {
          include: {
            audio: true,
            thumbnails: { include: { asset: true } },
          },
        },
      },
    });

    if (!category) {
      throw new ApiError(
        404,
        "The category you requested for deletion does not exist."
      );
    }

    try {
      const assetsToDelete = [];

      for (const blog of category.blogs) {
        if (blog.thumbnail) assetsToDelete.push(blog.thumbnail);
        if (blog.audio) assetsToDelete.push(blog.audio);
      }

      for (const project of category.projects) {
        if (project.audio) assetsToDelete.push(project.audio);
        if (project.thumbnails && project.thumbnails.length > 0) {
          for (const pt of project.thumbnails) {
            if (pt.asset) assetsToDelete.push(pt.asset);
          }
        }
      }

      for (const asset of assetsToDelete) {
        await AssetUtils.deleteAsset(supabase, asset.storagePath).catch(
          () => {}
        );
        await this.prisma.asset
          .delete({ where: { id: asset.id } })
          .catch(() => {});
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.blog.deleteMany({ where: { categoryId: id } });
        await tx.project.deleteMany({ where: { categoryId: id } });
        await tx.category.delete({ where: { id } });
      });

      await this.#clearCategoryCaches();
      await this.#clearBlogCaches();
      await this.#clearProjectCaches();
    } catch (err) {
      throw new ApiError(
        500,
        "Failed to delete the category and its related content. This might be due to a server connection issue."
      );
    }
  }

  /**
   * Retrieves a paginated list of categories.
   * * @param {string} userId - Context for caching (public vs specific user)
   * @param {number} page - Current page number
   * @param {number} limit - Items per page
   * @param {string} [search] - Keyword to filter categories by name
   * @param {string} [type] - Filter categories by type
   * @returns {Promise<Object>} Object containing category data and pagination metadata
   * @throws {ApiError} 500 if retrieval fails
   */
  async gets(
    userId,
    page,
    limit,
    search,
    type,
    sortBy = "latest",
    hasContentOnly = false
  ) {
    const cacheKey = `categories:list:${userId || "public"}:${page}:${limit}:${
      search || ""
    }:${type || ""}:${sortBy}:${hasContentOnly}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached)
        return typeof cached === "string" ? JSON.parse(cached) : cached;

      const { skip, limit: take } = PaginationUtils.create({ page, limit });

      const where = {
        ...(type && { type }),
        ...(search && {
          OR: [{ name: { contains: search, mode: "insensitive" } }],
        }),
        ...(hasContentOnly && {
          OR: [{ blogs: { some: {} } }, { projects: { some: {} } }],
        }),
      };

      const orderMapping = {
        latest: { createdAt: "desc" },
        alphabetical: { name: "asc" },
      };

      const [total, categories] = await Promise.all([
        this.prisma.category.count({ where }),
        this.prisma.category.findMany({
          where,
          skip,
          take,
          orderBy: orderMapping[sortBy] || orderMapping.latest,
          select: this.#categorySelect,
        }),
      ]);

      const result = {
        data: new CategoryListDto(categories).items,
        metadata: PaginationUtils.generateMetadata(total, page, take),
      };

      await redis.set(cacheKey, JSON.stringify(result), { ex: 86400 });
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Unable to load categories.");
    }
  }
}

export default new CategoryService();
