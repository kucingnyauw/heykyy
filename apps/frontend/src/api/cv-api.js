import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils";

/**
 * Retrieves the primary (main) CV record designated for public viewing and download.
 * * @returns {Promise<Object>} A promise resolving to the main CV data (e.g., title, file URL).
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getCvs = async () => {
  try {
    const res = await Client.get("/cvs/main");

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(
      error,
      (code, message) => message
    );
  }
};