import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Utility function to construct a FormData object for project payloads.
 * Efficiently handles text fields, boolean flags, related stack IDs, and complex gallery uploads
 * (distinguishing between new local files and existing server-hosted images).
 * * @param {Object} params - The construction parameters.
 * @param {Object} params.data - The raw project data object.
 * @param {string} params.data.title - The title of the project.
 * @param {string} [params.data.demoUrl] - The live demo URL.
 * @param {string} [params.data.repoUrl] - The repository URL.
 * @param {string} [params.data.summary] - A brief summary of the project.
 * @param {string} [params.data.contentHtml] - The detailed project case study in HTML.
 * @param {string} [params.data.status] - The project's publication status.
 * @param {string} [params.data.metaTitle] - SEO meta title.
 * @param {string} [params.data.metaDesc] - SEO meta description.
 * @param {boolean} [params.data.isFeatured] - Flag indicating if the project is featured.
 * @param {string} [params.data.categoryId] - The ID of the associated category.
 * @param {Object[]} [params.data.stacks] - Array of technology stack objects associated with the project.
 * @param {Object[]} [params.galleryItems=[]] - Array of gallery items (images).
 * @param {string} params.galleryItems[].type - The type of image ('LOCAL' for new uploads, 'SERVER' for existing).
 * @param {File|Blob} [params.galleryItems[].file] - The physical file (if type is 'LOCAL').
 * @param {string} [params.galleryItems[].id] - The existing asset ID (if type is 'SERVER').
 * @param {boolean} [params.isUpdate=false] - Flag indicating if this is an update operation (to handle existingImageIds).
 * @returns {FormData} The fully constructed FormData instance ready for multipart/form-data transmission.
 */
const buildProjectFormData = ({
  data,
  galleryItems = [],
  isUpdate = false,
}) => {
  const formData = new FormData();

  const append = (key, value) => {
    if (value === undefined || value === null || value === "") return;
    formData.append(key, value);
  };

  append("title", data.title);
  append("demoUrl", data.demoUrl);
  append("repoUrl", data.repoUrl);
  append("summary", data.summary);
  append("contentHtml", data.contentHtml);
  append("status", data.status);
  append("metaTitle", data.metaTitle);
  append("metaDesc", data.metaDesc);

  if (typeof data.isFeatured === "boolean") {
    formData.append("isFeatured", String(data.isFeatured));
  }

  if (data.categoryId) {
    formData.append("categoryId", data.categoryId);
  }

  if (Array.isArray(data.stacks)) {
    data.stacks.forEach((stack) => {
      if (stack?.id) {
        formData.append("stackIds", stack.id);
      }
    });
  }

  galleryItems
    .filter((item) => item.type === "LOCAL" && item.file)
    .forEach((item) => {
      formData.append("files", item.file);
    });

  if (isUpdate) {
    galleryItems
      .filter((item) => item.type === "SERVER" && item.id)
      .forEach((item) => {
        formData.append("existingImageIds", item.id);
      });
  }

  return formData;
};

/**
 * Submits a request to create a new project showcase.
 * Automatically converts the payload into FormData to handle gallery image uploads.
 * * @param {Object} payload - The payload containing project data and gallery items.
 * @param {Object} payload.data - The project data.
 * @param {Object[]} [payload.galleryItems] - Array of gallery images to upload.
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the created project data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the payload is missing.
 */
export const createProjects = async ({ data, galleryItems }) => {
  if (!data) throw new Error("Request payload is required to create a project.");

  try {
    const formData = buildProjectFormData({ data, galleryItems });
    const res = await Client.post("/projects", formData, {
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
 * Submits a request to update an existing project's details and gallery.
 * Automatically converts the payload into FormData to handle new file uploads and retain existing images.
 * * @param {Object} payload - The update payload.
 * @param {string} payload.id - The unique identifier of the project to update.
 * @param {Object} payload.data - The updated project data.
 * @param {Object[]} [payload.galleryItems] - The updated array of gallery items (mixed local and server).
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the updated project data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID or data is missing.
 */
export const updateProjects = async ({ id, data, galleryItems }) => {
  if (!id) throw new Error("Project ID is required to update the project.");
  if (!data) throw new Error("Request payload is required to update the project.");

  try {
    const formData = buildProjectFormData({
      data,
      galleryItems,
      isUpdate: true,
    });

    const res = await Client.put(`/projects/${id}`, formData, {
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
 * Submits a request to delete a specific project showcase by its ID.
 * * @param {string} id - The unique identifier of the project to be deleted.
 * @returns {Promise<string>} A promise resolving to the success message upon successful deletion.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID is missing.
 */
export const deleteProjects = async (id) => {
  if (!id) throw new Error("Project ID is required to delete the project.");

  try {
    const res = await Client.delete(`/projects/${id}`);
    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves the detailed information of a single project using its URL-friendly slug.
 * * @param {string} slug - The URL slug of the project to fetch.
 * @returns {Promise<Object>} A promise resolving to the retrieved project data.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the slug is missing.
 */
export const getProject = async (slug) => {
  if (!slug) throw new Error("Slug is required to fetch the project details.");

  try {
    const res = await Client.get(`/projects/${slug}`);
    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of projects with extensive filtering and sorting capabilities.
 * * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The maximum number of projects per page.
 * @param {string} [search] - Optional keyword to search against project titles or summaries.
 * @param {string} [status] - Optional filter by project publication status.
 * @param {string} [categoryId] - Optional filter by an associated category ID.
 * @param {boolean} [isFeatured] - Optional filter to retrieve only featured projects.
 * @param {string} [stackId] - Optional filter by an associated technology stack ID.
 * @param {string} [sortBy] - Optional sorting criteria (e.g., 'createdAt:desc').
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an array of projects and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getsProjects = async (
  page = 1,
  limit = 10,
  search,
  status,
  categoryId,
  isFeatured,
  stackId,
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
      ...(stackId && { stackId }),
      ...(sortBy && { sortBy }),
    };

    const res = await Client.get("/projects", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};