import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Submits a request to upload a standalone image or asset file to the server.
 * Automatically configures the request headers for multipart/form-data transmission.
 * * @param {File|Blob} img - The physical file object (image or document) to be uploaded.
 * @returns {Promise<{data: Object}>} A promise that resolves to an object containing the uploaded asset data (like the public URL).
 * @throws {Object} Throws a structured error payload if the image is missing or the API request fails.
 */
export const uploadImageContent = async (img) => {
  if (!img) {
    throw new Error("Image file is required to upload content.");
  }

  try {
    const res = await Client.post(
      "/upload/assets",
      { file: img }, 
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    return ResponseHandler.handleSuccess(res.data, ({ data }) => ({ data }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message,) => message);
  }
};