import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Retrieves a list of featured blog posts designated for highlighted display (e.g., on the homepage or blog landing page).
 * * @returns {Promise<Object[]>} A promise resolving to an array of featured blog data.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getBlogsFeatures = async () => {
  try {
    const res = await Client.get("/blogs/featured");

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves the detailed content of a single blog post using its URL-friendly slug.
 * Validates the presence of the slug before sending a GET request.
 * * @param {string} slug - The unique URL slug of the blog post to fetch.
 * @returns {Promise<Object>} A promise resolving to the retrieved blog post data.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the slug is missing.
 */
export const getBlogs = async (slug) => {
  if (!slug) {
    throw new Error("Slug is required to fetch the blog.");
  }

  try {
    const res = await Client.get(`/blogs/${slug}`);

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of published blog posts with optional filtering and sorting capabilities.
 * Constructs query parameters dynamically based on the provided arguments.
 * * @param {number} [page=1] - The page number to retrieve for pagination.
 * @param {number} [limit=10] - The maximum number of blog posts to retrieve per page.
 * @param {string} [search] - Optional keyword to search against blog titles or summaries.
 * @param {string} [categoryId] - Optional filter to retrieve blogs belonging to a specific category.
 * @param {string} [sortBy] - Optional sorting criteria (e.g., 'createdAt:desc' or 'views:desc').
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an array of blog posts and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getsBlogs = async (
  page = 1,
  limit = 10,
  search,
  categoryId,
  sortBy
) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(sortBy && { sortBy }),
    };

    const res = await Client.get("/blogs", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Toggles the "like" status (upvote/heart) for a specific blog post.
 * * @param {string} blogId - The unique identifier of the blog post to like or unlike.
 * @returns {Promise<string>} A promise resolving to a success message upon successfully toggling the status.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the blog ID is missing.
 */
export const likeBlogs = async (blogId) => {
  if (!blogId) {
    throw new Error("Blog ID is required to toggle like status.");
  }

  try {
    const res = await Client.post(`/blogs/${blogId}/toggle-like`);

    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a list of recommended or random blog posts related to a specific blog.
 * Useful for populating "Read More" or "Related Articles" sections at the end of a post.
 * * @param {string} slug - The slug of the current blog post to base recommendations on (ensuring the current post is excluded from the results).
 * @returns {Promise<Object[]>} A promise resolving to an array of recommended blog data.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the slug is missing.
 */
export const getRandomBlogs = async (slug) => {
  if (!slug) {
    throw new Error("Slug is required to fetch blog recommendations.");
  }

  try {
    const res = await Client.get(`/blogs/recommendations/${slug}`);

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};