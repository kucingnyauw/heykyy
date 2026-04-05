import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils";

/**
 * Mengambil data user yang sedang login.
 *
 * @returns {Promise<any>}
 */
export async function getCurrentUser() {
  try {
    const response = await Client.get("/auth/me", {
      _skipAuth: true,
    });

    return ResponseHandler.handleSuccess(response.data, (res) => res.data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}

/**
 * Membangun FormData untuk update profil user.
 *
 * @param {Object} data
 * @param {string} data.name
 * @param {string} [data.about]
 * @param {File|Blob|File[]} [data.file]
 *
 * @returns {FormData}
 */
export function buildUserFormData(data) {
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
}

/**
 * Mengupdate profil user (termasuk avatar).
 *
 * @param {Object} data
 * @returns {Promise<{data: any, message: string}>}
 */
export async function updateUserProfile(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data. Object is required.");
  }

  try {
    const payload = buildUserFormData(data);

    const response = await Client.patch("/users/profile", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return ResponseHandler.handleSuccess(
      response.data,
      ({ data, message }) => ({
        data,
        message,
      })
    );
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}

/**
 * Mengambil aktivitas user.
 *
 * @returns {Promise<any[]>}
 */
export async function getUserActivities() {
  try {
    const response = await Client.get("/users/activity");

    return ResponseHandler.handleSuccess(response.data, (res) => res.data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}
