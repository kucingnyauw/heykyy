import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Submits a request to create a new category.
 * Validates the presence of the payload before sending a POST request to the API.
 * * @param {Object} request - The category data payload containing the necessary fields (e.g., name, type).
 * @returns {Promise<{data: Object, message: string}>} A promise that resolves to an object containing the created category data and a success message.
 * @throws {Error} Throws an error if the payload is missing or if the API request fails.
 */
export const createCategory = async (request) => {
  if (!request) {
    throw new Error("Request payload is required to create a category.");
  }

  try {
    const res = await Client.post("/categories", request);
    
    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to update an existing category by its unique identifier.
 * Validates both the ID and the payload before sending a PUT request to the API.
 * * @param {string} id - The unique identifier of the category to update.
 * @param {Object} request - The updated category data payload.
 * @returns {Promise<{data: Object, message: string}>} A promise that resolves to an object containing the updated category data and a success message.
 * @throws {Error} Throws an error if the ID/payload is missing or if the API request fails.
 */
export const updateCategory = async (id, request) => {
  if (!id) {
    throw new Error("Category ID is required to update the category.");
  }

  if (!request) {
    throw new Error("Request payload is required to update the category.");
  }

  try {
    const res = await Client.put(`/categories/${id}`, request);
    
    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to delete a specific category by its ID.
 * Validates the presence of the ID before sending a DELETE request to the API.
 * * @param {string} id - The unique identifier of the category to be deleted.
 * @returns {Promise<string>} A promise that resolves to the success message upon successful deletion.
 * @throws {Error} Throws an error if the ID is missing or if the API request fails.
 */
export const deleteCategory = async (id) => {
  if (!id) {
    throw new Error("Category ID is required to delete the category.");
  }

  try {
    const res = await Client.delete(`/categories/${id}`);
    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of categories with optional filtering, sorting, and content presence checks.
 * Constructs query parameters dynamically based on the provided arguments.
 * * @param {number} [page=1] - The page number to retrieve for pagination.
 * @param {number} [limit=10] - The maximum number of categories to retrieve per page.
 * @param {string} [type] - Optional filter to retrieve categories by a specific type (e.g., 'BLOG', 'PROJECT').
 * @param {string} [search] - Optional keyword to search against category names.
 * @param {string} [sortBy] - Optional sorting criteria (e.g., 'name:asc').
 * @param {boolean} [hasContentOnly] - Optional flag to retrieve only categories that have associated content.
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an object containing an array of categories and pagination metadata.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getsCategories = async (
  page = 1, 
  limit = 10, 
  type, 
  search, 
  sortBy, 
  hasContentOnly
) => {
  try {
    const params = {
      page,
      limit,
      ...(type && { type }),
      ...(search && { search }),
      ...(sortBy && { sortBy }),
      ...(hasContentOnly !== undefined && { hasContentOnly }),
    };

    const res = await Client.get("/categories", { params });
 
    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};