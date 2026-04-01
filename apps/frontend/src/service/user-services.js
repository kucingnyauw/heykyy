import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Retrieves the currently authenticated user session.
 * Uses the `_skipAuth` flag to prevent interceptor-led redirect loops during initial page loads.
 * * @returns {Promise<Object>} A promise resolving to the current user's data (UserDto).
 * @throws {string|Error} Throws a formatted error string if the request fails.
 */
export const getMe = async () => {
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
 * Utility to construct a FormData object for user profile updates.
 * Safely handles textual fields and file uploads for avatars, ensuring empty values are ignored.
 * * @param {Object} data - The raw user data object.
 * @param {string} data.name - The user's full name.
 * @param {string} [data.about] - The user's bio or description.
 * @param {File|Blob|File[]} [data.file] - The avatar image file.
 * @returns {FormData} The constructed FormData instance.
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
 * Updates the user's profile information and avatar via a PATCH request.
 * Automatically handles multipart/form-data for file uploads.
 * * @param {Object} data - The updated profile data and optional avatar file.
 * @returns {Promise<{data: Object, message: string}>} The updated user data and success message.
 * @throws {string|Error} Throws a formatted error string if the update fails.
 */
export const updateUser = async (data) => {
  if (!data) throw new Error("Data is required to update user.");

  try {
    const payload = buildUserFormData(data);

    const res = await Client.patch("/users/profile", payload, {
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
 * Retrieves chronological activity logs for the authenticated user.
 * * @returns {Promise<Object[]>} A promise resolving to an array of user activities.
 * @throws {string|Error} Throws a formatted error string if the request fails.
 */
export const activity = async () => {
  try {
    const res = await Client.get("/users/activity");

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};
