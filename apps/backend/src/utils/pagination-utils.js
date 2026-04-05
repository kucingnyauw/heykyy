import { ApiError } from "./error-utils.js";

/**
 * Utility class for handling database pagination logic.
 * Provides methods for skip/limit calculation, metadata generation, and validation.
 */
export class PaginationUtils {
  /**
   * Creates pagination configuration with skip, limit, and basic metadata.
   * * @param {Object} options - Pagination options.
   * @param {number|string} [options.page=1] - The current page number.
   * @param {number|string} [options.limit=10] - Number of items per page.
   * @returns {Object} An object containing skip, limit, and initial metadata.
   * @throws {ApiError} 400 - If page or limit parameters are invalid.
   */
  static create({ page = 1, limit = 10 } = {}) {
    this.validate(page, limit);

    const validPage = Number(page);
    const validLimit = Number(limit);
    const skip = (validPage - 1) * validLimit;

    return {
      skip,
      limit: validLimit,
      metadata: {
        page: validPage,
        limit: validLimit,
        skip,
      },
    };
  }

  /**
   * Calculates the total number of pages based on total items and limit.
   * * @param {number} totalItems - Total count of records in database.
   * @param {number} itemsPerPage - Limit of items per page.
   * @returns {number} The total number of pages (minimum 1).
   */
  static calculateTotalPages(totalItems, itemsPerPage) {
    if (!totalItems || totalItems <= 0) return 1;
    return Math.ceil(totalItems / itemsPerPage);
  }

  /**
   * Generates comprehensive pagination metadata for API responses.
   * * @param {number} totalItems - Total count of records in database.
   * @param {number} currentPage - The current active page.
   * @param {number} itemsPerPage - The items per page limit.
   * @returns {Object} Metadata object including navigation flags.
   */
  static generateMetadata(totalItems, currentPage, itemsPerPage) {
    const totalPages = this.calculateTotalPages(totalItems, itemsPerPage);
    const current = Number(currentPage);

    return {
      currentPage: current,
      itemsPerPage: Number(itemsPerPage),
      totalItems,
      totalPages,
      hasNextPage: current < totalPages,
      hasPrevPage: current > 1,
    };
  }

  /**
   * Validates pagination parameters and throws ApiError if criteria aren't met.
   * * @param {number|string} page - Page number to validate.
   * @param {number|string} limit - Limit number to validate.
   * @returns {boolean} True if valid.
   * @throws {ApiError} 400 - If validation fails.
   */
  static validate(page, limit) {
    const p = Number(page);
    const l = Number(limit);

    if (isNaN(p) || p < 1) {
      throw new ApiError(400, "The 'page' parameter must be a positive number.");
    }

    if (isNaN(l) || l < 1) {
      throw new ApiError(400, "The 'limit' parameter must be a positive number.");
    }

    if (l > 100) {
      throw new ApiError(400, "The 'limit' parameter must not exceed 100 items per request.");
    }

    return true;
  }
}