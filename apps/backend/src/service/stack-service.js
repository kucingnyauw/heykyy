import { DEFAULT_CACHE_TTL } from "@heykyy/constant";

import { getPrisma } from "../application/database.js";
import { StackDto, StackListDto } from "../dtos/stack-dtos.js";
import { redis } from "../lib/redis.js";
import { ApiError, PaginationUtils } from "../utils/index.js";
import {
  createStackSchema,
  updateStackSchema,
} from "../validation/stack-validations.js";
import { validate } from "../validation/validation.js";

/**
 * Service class for managing the technology stack catalog.
 * Implements selective write-through caching and optimized delta updates.
 */
class StackService {
  /**
   * Accessor for the Prisma ORM client instance.
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Internal utility to flush all technology stack list caches in Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearStackCaches() {
    try {
      const keys = await redis.keys("stacks:list:*");
      if (keys.length > 0) await redis.del(...keys);
    } catch (err) {}
  }

  /**
   * Standard selection object to ensure consistent database responses.
   * @private
   * @returns {object}
   */
  get #stackSelect() {
    return {
      id: true,
      name: true,
      icon: true,
      url: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Registers a new technology stack.
   * @param {Object} request - The stack creation payload.
   * @returns {Promise<StackDto>} The newly created technology stack details.
   * @throws {ApiError} 400 if the technology name is already registered, 500 on database failure.
   */
  async create(request) {
    const payload = validate(createStackSchema, request);

    const existing = await this.prisma.stack.findUnique({
      where: { name: payload.name },
      select: { id: true },
    });

    if (existing) {
      throw new ApiError(
        400,
        `The technology named "${payload.name}" is already in our system. Please try a different name or edit the existing entry.`
      );
    }

    try {
      const stack = await this.prisma.stack.create({
        data: {
          name: payload.name,
          icon: payload.icon || null,
          url: payload.url || null,
        },
        select: this.#stackSelect,
      });

      await this.#clearStackCaches();
      return new StackDto(stack);
    } catch (err) {
      throw new ApiError(
        500,
        "We couldn't register the new technology stack due to a server error. Please try again in a few moments."
      );
    }
  }

  /**
   * Updates metadata for a stack only if the data has actually changed.
   * @param {string} id - UUID of the target technology stack.
   * @param {Object} request - The update payload.
   * @returns {Promise<StackDto>} The updated technology stack details.
   * @throws {ApiError} 404 if the stack is not found, 400 if the new name conflicts with another entry.
   */
  async update(id, request) {
    const existingStack = await this.prisma.stack.findUnique({
      where: { id },
    });

    if (!existingStack) {
      throw new ApiError(
        404,
        "We couldn't find the technology stack you're trying to update. It might have been deleted."
      );
    }

    const payload = validate(updateStackSchema, request);
    const updateData = {};

    const fields = ["name", "icon", "url"];
    fields.forEach((field) => {
      if (
        payload[field] !== undefined &&
        payload[field] !== existingStack[field]
      ) {
        updateData[field] = payload[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return new StackDto(existingStack);
    }

    if (updateData.name) {
      const nameConflict = await this.prisma.stack.findUnique({
        where: { name: updateData.name },
        select: { id: true },
      });

      if (nameConflict && nameConflict.id !== id) {
        throw new ApiError(
          400,
          `The name "${updateData.name}" is already used by another technology entry. Please choose a unique name.`
        );
      }
    }

    try {
      const updated = await this.prisma.stack.update({
        where: { id },
        data: updateData,
        select: this.#stackSelect,
      });

      await this.#clearStackCaches();
      return new StackDto(updated);
    } catch (err) {
      throw new ApiError(
        500,
        "Something went wrong while updating the technology stack. Please check your inputs and try again."
      );
    }
  }

  /**
   * Permanently removes a technology stack from the catalog.
   * @param {string} id - The unique identifier of the technology stack.
   * @returns {Promise<void>}
   * @throws {ApiError} 404 if the stack is not found, 500 if the stack is currently linked to other records.
   */
  async delete(id) {
    const stack = await this.prisma.stack.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!stack) {
      throw new ApiError(
        404,
        "The technology stack you're trying to delete doesn't exist in our records."
      );
    }

    try {
      await this.prisma.stack.delete({ where: { id } });
      await this.#clearStackCaches();
    } catch (err) {
      throw new ApiError(
        500,
        "This technology cannot be deleted because it is currently being used in your projects or blogs. Please remove those links first."
      );
    }
  }

  /**
   * Retrieves a paginated list of technology stacks with caching.
   * @param {number} page - The page number to retrieve.
   * @param {number} limit - The number of items per page.
   * @param {string} [search] - Optional keyword to search by name.
   * @param {boolean|string} [hasProjectOnly=false] - Filter to only return stacks used in projects.
   * @returns {Promise<Object>} Object containing the stack data and pagination metadata.
   * @throws {ApiError} 500 on server or retrieval failure.
   */
  async gets(page, limit, search, hasProjectOnly = false) {
    const isProjectOnlyFilter = hasProjectOnly === "true" || hasProjectOnly === true;
    const cacheKey = `stacks:list:${page}:${limit}:${search || ""}:${isProjectOnlyFilter}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) return typeof cached === "string" ? JSON.parse(cached) : cached;

      const { skip, limit: take } = PaginationUtils.create({ page, limit });

      const where = {
        ...(search && { name: { contains: search, mode: "insensitive" } }),
        ...(isProjectOnlyFilter && {
          projectStacks: {
            some: {},
          },
        }),
      };

      const [total, stacks] = await Promise.all([
        this.prisma.stack.count({ where }),
        this.prisma.stack.findMany({
          where,
          skip,
          take,
          orderBy: { name: "asc" },
          select: this.#stackSelect,
        }),
      ]);

      const result = {
        data: new StackListDto(stacks).items,
        metadata: PaginationUtils.generateMetadata(total, page, take),
      };

      await redis.set(cacheKey, JSON.stringify(result), {
        ex: DEFAULT_CACHE_TTL,
      });
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Unable to load technology stacks.");
    }
  }
}

export default new StackService();