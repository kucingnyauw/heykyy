import { DEFAULT_CACHE_TTL } from "@heykyy/constant";

import { getPrisma } from "../application/database.js";
import { EducationDto, EducationListDto } from "../dtos/education-dtos.js";
import { redis } from "../lib/redis.js";
import { ApiError, PaginationUtils } from "../utils/index.js";
import {
  createEducationSchema,
  updateEducationSchema,
} from "../validation/education-validations.js";
import { validate } from "../validation/validation.js";

/**
 * Service class for managing educational history.
 * Implements selective updates to maintain data integrity and optimize database writes.
 */
class EducationService {
  /**
   * Accessor for the Prisma ORM client instance.
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Invalidates all education-related list caches in Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearEducationCaches() {
    try {
      const keys = await redis.keys("educations:list:*");
      if (keys.length > 0) await redis.del(...keys);
    } catch (err) {}
  }

  /**
   * Standard selection object for Education entity queries.
   * @private
   * @returns {Object}
   */
  get #educationSelect() {
    return {
      id: true,
      title: true,
      institution: true,
      description: true,
      startYear: true,
      endYear: true,
      isCurrent: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Creates a new education history record.
   * @param {string} userId - The unique identifier of the user.
   * @param {Object} request - The education data payload.
   * @returns {Promise<EducationDto>} The newly created education record.
   * @throws {ApiError} If the database operation fails.
   */
  async create(userId, request) {
    const payload = validate(createEducationSchema, request);

    try {
      const education = await this.prisma.education.create({
        data: {
          ...payload,
          userId: userId,
        },
        select: this.#educationSelect,
      });

      await this.#clearEducationCaches();
      return new EducationDto(education);
    } catch (err) {
      throw new ApiError(
        500,
        "We encountered a problem while saving your education history. Please verify your details and try again."
      );
    }
  }

  /**
   * Updates an existing education record selectively by comparing current and provided data.
   * @param {string} userId - The unique identifier of the user owning the record.
   * @param {string} id - The ID of the education record to update.
   * @param {Object} request - The update payload containing modified fields.
   * @returns {Promise<EducationDto>} The updated education record.
   * @throws {ApiError} 404 if the record is not found, 500 on database failure.
   */
  async update(userId, id, request) {
    const existing = await this.prisma.education.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new ApiError(
        404,
        "We couldn't find the education record you're trying to update. It may have been deleted."
      );
    }

    const payload = validate(updateEducationSchema, request);
    const updateData = {};

    const fields = [
      "title",
      "institution",
      "description",
      "startYear",
      "endYear",
      "isCurrent",
    ];

    fields.forEach((field) => {
      if (payload[field] !== undefined && payload[field] !== existing[field]) {
        updateData[field] = payload[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return new EducationDto(existing);
    }

    try {
      const updated = await this.prisma.education.update({
        where: { id },
        data: updateData,
        select: this.#educationSelect,
      });

      await this.#clearEducationCaches();
      return new EducationDto(updated);
    } catch (err) {
      throw new ApiError(
        500,
        "An error occurred while updating your record. Please refresh the page and try again."
      );
    }
  }

  /**
   * Deletes an education history record.
   * @param {string} userId - The unique identifier of the user owning the record.
   * @param {string} id - The ID of the education record to delete.
   * @returns {Promise<void>}
   * @throws {ApiError} 404 if the record is not found, 500 on database failure.
   */
  async delete(userId, id) {
    const education = await this.prisma.education.findFirst({
      where: { id, userId },
    });

    if (!education) {
      throw new ApiError(
        404,
        "The education record you want to delete was not found. It may have already been removed."
      );
    }

    try {
      await this.prisma.education.delete({ where: { id } });
      await this.#clearEducationCaches();
    } catch (err) {
      throw new ApiError(
        500,
        "We were unable to remove the education record. Please try again later."
      );
    }
  }

  /**
   * Fetches a paginated list of education records with a cache-aside strategy.
   * @param {number} page - The page number to retrieve.
   * @param {number} limit - The number of records per page.
   * @param {string} [search] - Optional keyword to filter by institution or title.
   * @param {boolean|string} [isCurrent] - Filter by current education status.
   * @returns {Promise<Object>} Object containing the list of education records and pagination metadata.
   * @throws {ApiError} If retrieval or caching fails.
   */
  async gets(page, limit, search, isCurrent) {
    const isCurrentFilter = isCurrent === "true" || isCurrent === true;
    const cacheKey = `educations:list:${page}:${limit}:${search || ""}:${
      isCurrent !== undefined ? isCurrentFilter : ""
    }`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached)
        return typeof cached === "string" ? JSON.parse(cached) : cached;

      const { skip, limit: take } = PaginationUtils.create({ page, limit });

      const where = {
        ...(isCurrent !== undefined && {
          isCurrent: isCurrentFilter,
        }),
        ...(search && {
          OR: [
            { institution: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const [total, educations] = await Promise.all([
        this.prisma.education.count({ where }),
        this.prisma.education.findMany({
          where,
          skip,
          take,
          orderBy: [{ isCurrent: "desc" }, { startYear: "desc" }],
          select: this.#educationSelect,
        }),
      ]);

      const result = {
        data: new EducationListDto(educations).items,
        metadata: PaginationUtils.generateMetadata(total, page, take),
      };

      await redis.set(cacheKey, JSON.stringify(result), {
        ex: DEFAULT_CACHE_TTL,
      });
      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(500, "Unable to load education history.");
    }
  }
}

export default new EducationService();