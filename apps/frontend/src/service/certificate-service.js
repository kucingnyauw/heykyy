import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Retrieves a paginated list of professional certifications for public display.
 * Default limit is set to 6 to accommodate common grid layouts (e.g., 2x3 or 3x2).
 * * @param {number} [page=1] - The page number to retrieve for pagination.
 * @param {number} [limit=6] - The maximum number of certification records to retrieve per page.
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an object containing an array of certificates and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getCertification = async (page = 1, limit = 6) => {
  try {
    const params = {
      page,
      limit,
    };

    const res = await Client.get("/certificates", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};