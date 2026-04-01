import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Submits a request to create a new technology stack entry.
 * Validates the presence of the payload before sending a POST request to the API.
 * * @param {Object} request - The technology stack data payload (e.g., name, icon url).
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the created technology stack data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the payload is missing.
 */
export const createTech = async (request) => {
  if (!request) {
    throw new Error("Request payload is required to create a technology stack.");
  }

  try {
    const res = await Client.post("/stacks", request);
    
    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to update an existing technology stack by its unique identifier.
 * Validates both the ID and the payload before sending a PUT request to the API.
 * * @param {string} id - The unique identifier of the technology stack to update.
 * @param {Object} request - The updated technology stack data payload.
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the updated technology stack data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID or payload is missing.
 */
export const updateTech = async (id, request) => {
  if (!id) throw new Error("Tech ID is required to update the technology stack.");
  if (!request) throw new Error("Request payload is required to update the technology stack.");

  try {
    const res = await Client.put(`/stacks/${id}`, request);
    
    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to delete a specific technology stack by its ID.
 * Validates the presence of the ID before sending a DELETE request to the API.
 * * @param {string} id - The unique identifier of the technology stack to be deleted.
 * @returns {Promise<string>} A promise resolving to a success message upon successful deletion.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID is missing.
 */
export const deleteTech = async (id) => {
  if (!id) {
    throw new Error("Tech ID is required to delete the technology stack.");
  }

  try {
    const res = await Client.delete(`/stacks/${id}`);
    
    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of technology stacks with optional filtering.
 * Constructs query parameters dynamically based on the provided arguments.
 * * @param {number} [page=1] - The page number to retrieve for pagination.
 * @param {number} [limit=10] - The maximum number of stacks to retrieve per page.
 * @param {string} [search] - Optional keyword to search against technology stack names.
 * @param {boolean} [hasProjectOnly] - Optional flag to retrieve only technology stacks that are associated with at least one project.
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an array of technology stacks and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getsTech = async (page = 1, limit = 10, search, hasProjectOnly) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(hasProjectOnly !== undefined && { hasProjectOnly }),
    };

    const res = await Client.get("/stacks", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};