import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Utility function to construct a FormData object for blog creation and updates.
 * Safely handles string fields, booleans, arrays (like tags), and file attachments,
 * ensuring that empty strings or null values are filtered out before appending.
 * * @param {Object} data - The raw blog data object to be converted.
 * @param {string} data.title - The blog title.
 * @param {string} data.summary - A short summary of the blog.
 * @param {string} data.contentHtml - The rich text HTML content.
 * @param {string} data.status - The publication status (e.g., 'PUBLISHED', 'DRAFT').
 * @param {string} data.metaTitle - SEO meta title.
 * @param {string} data.metaDesc - SEO meta description.
 * @param {string} data.categoryId - The ID of the associated category.
 * @param {boolean} [data.isFeatured] - Flag indicating if the blog is featured.
 * @param {string[]} [data.tags] - An array of tag names.
 * @param {File|Blob|File[]} [data.file] - The cover image file or array containing the file.
 * @returns {FormData} The fully constructed FormData instance ready for transmission.
 */
export const buildBlogsFormData = (data) => {
  const formData = new FormData();

  const append = (key, value) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    formData.append(key, value);
  };

  append("title", data.title);
  append("summary", data.summary);
  append("contentHtml", data.contentHtml);
  append("status", data.status);
  append("metaTitle", data.metaTitle);
  append("metaDesc", data.metaDesc);
  append("categoryId", data.categoryId);

  if (typeof data.isFeatured === "boolean") {
    formData.append("isFeatured", String(data.isFeatured));
  }

  if (Array.isArray(data.tags)) {
    data.tags.forEach((tag) => {
      if (tag) formData.append("tags[]", tag);
    });
  }

  if (data.file) {
    const file = Array.isArray(data.file) ? data.file[0] : data.file;
    if (file instanceof File || file instanceof Blob) {
      formData.append("file", file);
    }
  }

  return formData;
};

/**
 * Submits a request to create a new blog post.
 * Automatically parses the payload into FormData to support file uploads.
 * * @param {Object} request - The blog data payload containing textual fields and the file asset.
 * @returns {Promise<{data: Object, message: string}>} An object containing the created blog data and a success message.
 * @throws {Error} Throws an error if the payload is missing or if the API request fails.
 */
export const createBlogs = async (request) => {
  if (!request) throw new Error("Request payload is required to create a blog.");

  try {
    const formData = buildBlogsFormData(request);
    const res = await Client.post("/blogs", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to update an existing blog post by its unique ID.
 * Automatically parses the payload into FormData to handle potential cover image updates.
 * * @param {string} id - The unique identifier of the blog to update.
 * @param {Object} request - The updated blog data payload.
 * @returns {Promise<{data: Object, message: string}>} An object containing the updated blog data and a success message.
 * @throws {Error} Throws an error if the ID/payload is missing or if the API request fails.
 */
export const updateBlogs = async (id, request) => {
  if (!id) throw new Error("Blog ID is required to update the blog.");
  if (!request) throw new Error("Request payload is required to update the blog.");

  try {
    const formData = buildBlogsFormData(request);
    const res = await Client.put(`/blogs/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return ResponseHandler.handleSuccess(res.data, ({ data, message }) => ({
      data,
      message,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to delete a specific blog post by its ID.
 * * @param {string} id - The unique identifier of the blog to be deleted.
 * @returns {Promise<string>} A promise that resolves to the success message upon deletion.
 * @throws {Error} Throws an error if the ID is missing or if the API request fails.
 */
export const deleteBlogs = async (id) => {
  if (!id) throw new Error("Blog ID is required to delete the blog.");

  try {
    const res = await Client.delete(`/blogs/${id}`);
    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a single blog post's details using its URL-friendly slug.
 * * @param {string} slug - The URL slug of the blog to fetch.
 * @returns {Promise<Object>} A promise that resolves to the retrieved blog data (BlogDto).
 * @throws {Error} Throws an error if the slug is missing or if the API request fails.
 */
export const getBlog = async (slug) => {
  if (!slug) throw new Error("Slug is required to fetch the blog.");

  try {
    const res = await Client.get(`/blogs/${slug}`);
    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of blog posts with optional filtering and sorting parameters.
 * * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The maximum number of items per page.
 * @param {string} [search] - Keyword to search against blog titles or summaries.
 * @param {string} [status] - Filter by blog publication status (e.g., 'PUBLISHED').
 * @param {string} [categoryId] - Filter by a specific category ID.
 * @param {boolean} [isFeatured] - Filter to retrieve only featured or non-featured blogs.
 * @param {string} [sortBy] - Sorting criteria (e.g., 'createdAt:desc').
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an array of blogs and pagination metadata.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getsBlogs = async (
  page = 1,
  limit = 10,
  search,
  status,
  categoryId,
  isFeatured,
  sortBy
) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(isFeatured !== undefined && { isFeatured }),
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