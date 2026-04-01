import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Utility function to construct a FormData object for certificate payloads.
 * Efficiently appends textual data and handles multiple file uploads (such as image previews and PDF documents),
 * ensuring that empty strings or null values are omitted.
 * * @param {Object} data - The raw certificate data object.
 * @param {string} data.title - The title of the certificate.
 * @param {string} data.issuer - The organization or entity that issued the certificate.
 * @param {string|number} data.year - The year the certificate was issued.
 * @param {string} [data.summary] - A brief summary or description of the certificate.
 * @param {File[]|Blob[]} [data.files] - An array of files associated with the certificate (e.g., images, PDFs).
 * @returns {FormData} The fully constructed FormData instance ready for multipart/form-data transmission.
 */
const buildCertificatesFormData = (data) => {
  const formData = new FormData();

  const append = (key, value) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    formData.append(key, value);
  };

  append("title", data.title);
  append("issuer", data.issuer);
  append("year", data.year);
  append("summary", data.summary);

  if (Array.isArray(data.files)) {
    data.files.forEach((file) => {
      if (file instanceof File || file instanceof Blob) {
        formData.append("files", file);
      }
    });
  }

  return formData;
};

/**
 * Submits a request to create a new professional certificate.
 * Automatically converts the payload into FormData to handle file uploads.
 * * @param {Object} request - The certificate data payload containing fields and files.
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the created certificate data and a success message.
 * @throws {Error} Throws an error if the payload is missing or if the API request fails.
 */
export const createCertificates = async (request) => {
  if (!request) {
    throw new Error("Request payload is required to create a certificate.");
  }

  try {
    const payload = buildCertificatesFormData(request);
    const res = await Client.post("/certificates", payload, {
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
 * Submits a request to update an existing certificate by its unique ID.
 * Automatically converts the payload into FormData to accommodate potential file updates.
 * * @param {string} id - The unique identifier of the certificate to update.
 * @param {Object} request - The updated certificate data payload.
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the updated certificate data and a success message.
 * @throws {Error} Throws an error if the ID/payload is missing or if the API request fails.
 */
export const updateCertificates = async (id, request) => {
  if (!id) throw new Error("Certificate ID is required to update the certificate.");
  if (!request) throw new Error("Request payload is required to update the certificate.");

  try {
    const payload = buildCertificatesFormData(request);
    const res = await Client.put(`/certificates/${id}`, payload, {
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
 * Submits a request to delete a specific certificate by its ID.
 * * @param {string} id - The unique identifier of the certificate to be deleted.
 * @returns {Promise<string>} A promise resolving to the success message upon successful deletion.
 * @throws {Error} Throws an error if the ID is missing or if the API request fails.
 */
export const deleteCertificates = async (id) => {
  if (!id) throw new Error("Certificate ID is required to delete the certificate.");

  try {
    const res = await Client.delete(`/certificates/${id}`);
    return ResponseHandler.handleSuccess(res.data, ({ message }) => message);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves the detailed information of a single certificate using its unique ID.
 * * @param {string} id - The unique identifier of the certificate to fetch.
 * @returns {Promise<Object>} A promise resolving to the retrieved certificate data.
 * @throws {Error} Throws an error if the ID is missing or if the API request fails.
 */
export const getCertificate = async (id) => {
  if (!id) throw new Error("Certificate ID is required to fetch details.");

  try {
    const res = await Client.get(`/certificates/${id}`);
    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Retrieves a paginated list of professional certificates with optional filtering and sorting.
 * * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The maximum number of items per page.
 * @param {string} [search] - Optional keyword to search against certificate titles or issuers.
 * @param {string|number} [year] - Optional filter to retrieve certificates issued in a specific year.
 * @param {string} [sortBy] - Optional sorting criteria (e.g., 'year:desc').
 * @returns {Promise<{data: Object[], metadata: Object}>} A promise resolving to an array of certificates and pagination metadata.
 * @throws {Error} Throws an error if the API request fails.
 */
export const getsCertificates = async (
  page = 1,
  limit = 10,
  search,
  year,
  sortBy
) => {
  try {
    const params = {
      page,
      limit,
      ...(search && { search }),
      ...(year && { year }),
      ...(sortBy && { sortBy }),
    };

    const res = await Client.get("/certificates", { params });
    
    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};