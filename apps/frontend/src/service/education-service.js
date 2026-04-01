import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Retrieves a list of educational records for public display.
 * Uses a high limit (100) to ensure the complete chronological education history 
 * is fetched in a single request.
 * * @returns {Promise<Object[]>} A promise resolving to an array of education data.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getEducation = async () => {
  try {
    const params = {
      limit: 100,
    };

    const res = await Client.get("/educations", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};