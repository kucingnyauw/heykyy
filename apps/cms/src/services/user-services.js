import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Utility function to construct a FormData object for user profile updates.
 * Efficiently handles textual data and single file uploads for the user avatar,
 * ensuring that empty strings or null values are safely omitted.
 * * @param {Object} data - The raw user profile data.
 * @param {string} data.name - The user's full name or display name.
 * @param {string} [data.about] - A brief bio or description about the user.
 * @param {File|Blob|File[]} [data.file] - The physical image file for the user's avatar.
 * @returns {FormData} The fully constructed FormData instance ready for multipart/form-data transmission.
 */
export const buildUserFormData = (data) => {
  const formData = new FormData();

  const append = (key, value) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    formData.append(key, value);
  };

  append("name", data.name);
  append("about", data.about);

  if (data.file) {
    const file = Array.isArray(data.file) ? data.file[0] : data.file;
    if (file instanceof File || file instanceof Blob) {
      formData.append("file", file);
    }
  }

  return formData;
};

/**
 * Retrieves the currently authenticated user's session details.
 * Bypasses standard authentication interceptor triggers using the `_skipAuth` flag 
 * to gracefully handle initial page loads without forcing a redirect loop if unauthenticated.
 * * @returns {Promise<Object>} A promise resolving to the current user's data (UserDto).
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const me = async () => {
  try {
    const res = await Client.get("/auth/me", {
      _skipAuth: true,
    });

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Submits a request to update the currently authenticated user's profile information and avatar.
 * Automatically converts the payload into FormData to handle the avatar image upload via a PATCH request.
 * * @param {Object} data - The updated user profile data payload.
 * @returns {Promise<{data: Object, message: string}>} A promise resolving to the updated user data and a success message.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the payload is missing.
 */
export const updateUser = async (data) => {
  if (!data) throw new Error("Data payload is required to update the user profile.");

  try {
    const payload = buildUserFormData(data);

    const res = await Client.post("/users/profile", payload, {
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
 * Retrieves a chronological log of recent activities performed by the currently authenticated user.
 * * @returns {Promise<Object[]>} A promise resolving to an array of user activity logs.
 * @throws {string|Error} Throws a formatted error string if the API request fails.
 */
export const activity = async () => {
  try {
    const res = await Client.get("/users/activity");

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};