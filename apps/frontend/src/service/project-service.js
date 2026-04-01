import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Retrieves a list of featured projects designated for highlighted display (e.g., on the portfolio homepage).
 * * @returns {Promise<Object[]>} A promise resolving to an array of featured project data.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getProjectsFeatures = async () => {
  try {
    const res = await Client.get("/projects/featured");

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of published projects with optional filtering and sorting capabilities.
 * Constructs query parameters dynamically based on the provided arguments.
 * * @param {number} [page=1] - The page number to retrieve for pagination.
 * @param {number} [limit=10] - The maximum number of projects to retrieve per page.
 * @param {string} [search] - Optional keyword to search against project titles or summaries.
 * @param {string} [categoryId] - Optional filter to retrieve projects belonging to a specific category.
 * @param {string} [sortBy] - Optional sorting criteria (e.g., 'createdAt:desc').
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an array of projects and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getProjects = async (
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

    const res = await Client.get("/projects", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves the detailed information of a single project using its URL-friendly slug.
 * * @param {string} slug - The unique URL slug of the project to fetch.
 * @returns {Promise<Object>} A promise resolving to the retrieved project data (ProjectDto).
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the slug is missing.
 */
export const getProject = async (slug) => {
  if (!slug) {
    throw new Error("Slug is required to fetch the project details.");
  }

  try {
    const res = await Client.get(`/projects/${slug}`);

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a list of recommended or similar projects based on a specific project.
 * Useful for "View Other Projects" or "Similar Works" sections.
 * * @param {string} slug - The slug of the current project to base recommendations on.
 * @returns {Promise<Object[]>} A promise resolving to an array of recommended project data.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the slug is missing.
 */
export const getRandomProject = async (slug) => {
  if (!slug) {
    throw new Error("Current project slug is required for recommendations.");
  }

  try {
    const res = await Client.get(`/projects/recommendations/${slug}`);

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Toggles the "like" status (upvote/favorite) for a specific project.
 * * @param {string} projectId - The unique identifier of the project to like or unlike.
 * @returns {Promise<string>} A promise resolving to a success message upon successfully toggling the status.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the project ID is missing.
 */
export const likeProject = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required to toggle the like status.");
  }

  try {
    const res = await Client.post(`/projects/${projectId}/toggle-like`);

    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};