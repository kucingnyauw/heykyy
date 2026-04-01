import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Submits a request to create a new education record.
 * Validates the presence of the payload before sending a POST request to the API.
 * * @param {Object} request - The education data payload containing details like institution, degree, and dates.
 * @returns {Promise<{data: Object, message: string}>} A promise that resolves to an object containing the created education data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the payload is missing.
 */
export const createEducation = async (request) => {
  if (!request) {
    throw new Error("Request payload is required to create an education record.");
  }

  try {
    const res = await Client.post("/educations", request);
    
    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to update an existing education record by its unique identifier.
 * Validates both the ID and the payload before sending a PUT request to the API.
 * * @param {string} id - The unique identifier of the education record to update.
 * @param {Object} request - The updated education data payload.
 * @returns {Promise<{data: Object, message: string}>} A promise that resolves to an object containing the updated education data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID or payload is missing.
 */
export const updateEducation = async (id, request) => {
  if (!id) throw new Error("Education ID is required to update the education record.");
  if (!request) throw new Error("Request payload is required to update the education record.");

  try {
    const res = await Client.put(`/educations/${id}`, request);
    
    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to delete a specific education record by its ID.
 * Validates the presence of the ID before sending a DELETE request to the API.
 * * @param {string} id - The unique identifier of the education record to be deleted.
 * @returns {Promise<string>} A promise that resolves to a success message upon successful deletion.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID is missing.
 */
export const deleteEducation = async (id) => {
  if (!id) {
    throw new Error("Education ID is required to delete the education record.");
  }

  try {
    const res = await Client.delete(`/educations/${id}`);
    
    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of education records with optional filtering.
 * Constructs query parameters dynamically based on the provided arguments.
 * * @param {number} [page=1] - The page number to retrieve for pagination.
 * @param {number} [limit=10] - The maximum number of records to retrieve per page.
 * @param {string} [search] - Optional keyword to search against institutions or degrees.
 * @param {boolean} [isCurrent] - Optional flag to filter by currently ongoing education.
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an object containing an array of education records and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getsEducations = async (page = 1, limit = 10, search, isCurrent) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(isCurrent !== undefined && { isCurrent }),
    };

    const res = await Client.get("/educations", { params });
    
    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};