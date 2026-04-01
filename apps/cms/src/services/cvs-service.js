import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Utility function to construct a FormData object for Curriculum Vitae (CV) payloads.
 * Efficiently handles text fields, boolean flags, and single file uploads (parsing FileList, arrays, or single File/Blob objects),
 * ensuring that empty strings or null values are safely omitted.
 * * @param {Object} data - The raw CV data object.
 * @param {string} data.title - The title or name of the CV document.
 * @param {boolean} [data.isMain] - Flag indicating if this is the primary CV to be displayed.
 * @param {File|Blob|FileList|File[]} [data.file] - The physical document file (usually PDF) associated with the CV.
 * @returns {FormData} The fully constructed FormData instance ready for multipart/form-data transmission.
 */
export const buildCvsFormData = (data) => {
  const formData = new FormData();

  const append = (key, value) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    formData.append(key, value);
  };

  append("title", data.title);
  
  if (data.isMain !== undefined) {
    formData.append("isMain", String(data.isMain));
  }

  if (data.file) {
    const file = data.file instanceof FileList ? data.file[0] : (Array.isArray(data.file) ? data.file[0] : data.file);

    if (file instanceof File || file instanceof Blob) {
      formData.append("file", file);
    }
  }

  return formData;
};

/**
 * Submits a request to create a new CV record.
 * Automatically converts the payload into FormData to handle the document file upload.
 * * @param {Object} data - The CV data payload containing metadata and the document file.
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the created CV data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the payload is missing.
 */
export const createCvs = async (data) => {
  if (!data) throw new Error("Data payload is required to create a CV.");

  try {
    const payload = buildCvsFormData(data);
    const res = await Client.post("/cvs", payload, {
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
 * Submits a request to update an existing CV's metadata or its associated file.
 * Automatically converts the payload into FormData to accommodate potential file updates.
 * * @param {string} id - The unique identifier of the CV to update.
 * @param {Object} data - The updated CV data payload.
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the updated CV data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID/payload is missing.
 */
export const updateCvs = async (id, data) => {
  if (!id) throw new Error("CV ID is required to update the CV.");
  if (!data) throw new Error("Data payload is required to update the CV.");

  try {
    const payload = buildCvsFormData(data);
    const res = await Client.put(`/cvs/${id}`, payload, {
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
 * Submits a request to delete a specific CV record by its ID.
 * * @param {string} id - The unique identifier of the CV to be deleted.
 * @returns {Promise<string>} A promise resolving to the success message upon successful deletion.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the ID is missing.
 */
export const deleteCvs = async (id) => {
  if (!id) throw new Error("CV ID is required to delete the CV.");

  try {
    const res = await Client.delete(`/cvs/${id}`);
    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of CV records, typically used for administrative management.
 * * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The maximum number of items per page.
 * @param {string} [search] - Optional keyword to search against CV titles.
 * @param {boolean} [isMain] - Optional filter to retrieve only the main CV or only non-main CVs.
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an array of CV records and pagination metadata.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const getsCvs = async (page = 1, limit = 10, search, isMain) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(isMain !== undefined && { isMain }),
    };

    const res = await Client.get("/cvs", { params });
    
    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};