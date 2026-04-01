export class PaginationUtils {
    /**
     * Create pagination configuration with skip, limit, and metadata.
     * @param {Object} options
     * @param {number|string} options.page - Current page (default: 1)
     * @param {number|string} options.limit - Items per page (default: 10)
     * @returns {Object} Pagination config with skip, limit, and metadata
     */
    static create({ page = 1, limit = 10 } = {}) {
      const parsedPage = Number(page);
      const parsedLimit = Number(limit);
  
      const validPage = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const validLimit =
        !isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 100
          ? parsedLimit
          : 10;
  
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
     * Calculate total pages based on total items and items per page.
     * @param {number} totalItems - Total number of items
     * @param {number} itemsPerPage - Items per page
     * @returns {number} Total pages
     */
    static calculateTotalPages(totalItems, itemsPerPage) {
      if (!totalItems || totalItems <= 0) return 1;
      return Math.ceil(totalItems / itemsPerPage);
    }
  
    /**
     * Generate pagination metadata for API response.
     * @param {number} totalItems - Total number of items
     * @param {number} currentPage - Current page
     * @param {number} itemsPerPage - Items per page
     * @returns {Object} Pagination metadata
     */
    static generateMetadata(totalItems, currentPage, itemsPerPage) {
      const totalPages = this.calculateTotalPages(totalItems, itemsPerPage);
  
      return {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      };
    }
  
    /**
     * Validate pagination parameters.
     * @param {number|string} page - Page number
     * @param {number|string} limit - Items per page
     * @returns {Object} Validation result { isValid, errors }
     */
    static validate(page, limit) {
      const errors = [];
      const p = Number(page);
      const l = Number(limit);
  
      if (isNaN(p) || p < 1)
        errors.push("The 'page' parameter must be a positive number.");
      if (isNaN(l) || l < 1)
        errors.push("The 'limit' parameter must be a positive number.");
      if (l > 100)
        errors.push("The 'limit' parameter must not exceed 100.");
  
      return {
        isValid: errors.length === 0,
        errors,
      };
    }
  }
  