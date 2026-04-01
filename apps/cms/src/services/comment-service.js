import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Deletes a specific comment by its unique identifier.
 *
 * @param {string|number} id - The unique identifier of the comment to be deleted.
 * @returns {Promise<string>} A promise that resolves to a success message upon deletion.
 * @throws {Error} Throws an error if the ID is not provided or if the API request fails.
 */
export const deleteComment = async (id) => {
  if (!id) {
    throw new Error("Comment ID is required to delete comment.");
  }

  try {
    const res = await Client.delete(`/comments/${id}`);

    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Fetches a paginated list of comments for administrative monitoring.
 * Allows optional filtering by search terms and reply status.
 *
 * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The maximum number of records per page.
 * @param {string} [search] - Optional search keyword to filter comments.
 * @param {boolean} [isReplied] - Optional flag to filter comments by their reply status.
 * @returns {Promise<{data: Array, metadata: Object}>} A promise that resolves to an object containing the comments data array and pagination metadata.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getsCommentsMonitor = async (
  page = 1,
  limit = 10,
  search,
  isReplied
) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(isReplied !== undefined && { isReplied }),
    };

    const res = await Client.get("/comments/monitor", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};