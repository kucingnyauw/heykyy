import { ResponseHandler } from "@heykyy/utils";
import { Client } from "../lib/axios";

/**
 * Submits a request to create a new comment on a specific blog post.
 * * @param {Object} request - The comment data payload (e.g., content, author name).
 * @param {string} blogId - The unique identifier of the blog post being commented on.
 * @returns {Promise<Object>} A promise resolving to the newly created comment data.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the blog ID is missing.
 */
export const createComments = async (request, blogId) => {
  if (!blogId) throw new Error("Blog ID is required to post a comment.");

  try {
    const res = await Client.post(`/comments/${blogId}`, request);

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to update the content of an existing comment.
 * * @param {string} id - The unique identifier of the comment to update.
 * @param {Object} request - The updated comment data payload.
 * @returns {Promise<Object>} A promise resolving to the updated comment data.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID is missing.
 */
export const updateComments = async (id, request) => {
  if (!id) throw new Error("Comment ID is required to update.");

  try {
    const res = await Client.put(`/comments/${id}`, request);

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to delete a specific comment by its ID.
 * * @param {string} id - The unique identifier of the comment to be deleted.
 * @returns {Promise<string>} A promise resolving to a success message upon successful deletion.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID is missing.
 */
export const deleteComments = async (id) => {
  if (!id) throw new Error("Comment ID is required to delete.");

  try {
    const res = await Client.delete(`/comments/${id}`);

    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of comments associated with a specific blog post, identified by its slug.
 * * @param {string} slug - The URL-friendly slug of the blog post.
 * @param {number} [page=1] - The page number to retrieve for pagination.
 * @param {number} [limit=10] - The maximum number of comments to retrieve per page.
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an object containing an array of comments and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the slug is missing.
 */
export const getComments = async (slug, page = 1, limit = 10) => {
  if (!slug) throw new Error("Blog slug is required to fetch comments.");

  try {
    const params = {
      slug,
      page,
      limit,
    };

    const res = await Client.get("/comments", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};