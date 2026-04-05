import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils";

/**
 * Mengambil daftar blog featured.
 *
 * @returns {Promise<any[]>}
 */
export async function getFeaturedBlogs() {
  try {
    const response = await Client.get("/blogs/featured");
    return ResponseHandler.handleSuccess(response.data, (res) => res.data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}

/**
 * Mengambil detail blog berdasarkan slug.
 *
 * @param {string} slug
 * @returns {Promise<any>}
 */
export async function getBlogBySlug(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Invalid slug. A non-empty string is required.");
  }

  try {
    const response = await Client.get(`/blogs/${slug}`);
    return ResponseHandler.handleSuccess(response.data, (res) => res.data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}

/**
 * Mengambil daftar blog dengan pagination dan filter.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @param {string} [params.search]
 * @param {string} [params.categoryId]
 * @param {string} [params.sortBy]
 *
 * @returns {Promise<{data: any[], metadata: any}>}
 */
export async function getBlogs({
  page = 1,
  limit = 10,
  search,
  categoryId,
  sortBy,
} = {}) {
  try {
    const params = {
      page,
      limit,
      status : "PUBLISHED",
      ...(search && { search }),
      ...(categoryId && { categoryId }),
      ...(sortBy && { sortBy }),
    };

    const response = await Client.get("/blogs", { params });

    return ResponseHandler.handleSuccess(response.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}

/**
 * Toggle like pada blog.
 *
 * @param {string} blogId
 * @returns {Promise<string>}
 */
export async function toggleBlogLike(blogId) {
  if (!blogId || typeof blogId !== "string") {
    throw new Error("Invalid blogId. A non-empty string is required.");
  }

  try {
    const response = await Client.post(`/blogs/${blogId}/toggle-like`);
    return ResponseHandler.handleSuccess(response.data, (res) => res.message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}

/**
 * Mengambil rekomendasi blog berdasarkan slug.
 *
 * @param {string} slug
 * @returns {Promise<any[]>}
 */
export async function getRecommendedBlogs(slug) {
  if (!slug || typeof slug !== "string") {
    throw new Error("Invalid slug. A non-empty string is required.");
  }

  try {
    const response = await Client.get(`/blogs/recommendations/${slug}`);
    return ResponseHandler.handleSuccess(response.data, (res) => res.data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}