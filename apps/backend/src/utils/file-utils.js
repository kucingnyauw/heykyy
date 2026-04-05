import { ApiError } from "./error-utils.js";

/**
 * Utility class for handling file-related operations.
 * Provides helper methods for sanitizing, validating, and managing file metadata.
 */
export class FileUtils {
  /**
   * Sanitizes a file name by removing unsafe characters and standardizing its format.
   *
   * @param {string} fileName - The original file name to be sanitized.
   * @returns {string} The sanitized file name with original extension preserved.
   * @throws {ApiError} 400 - If the provided file name is invalid or not a string.
   */
  static sanitizeFileName(fileName) {
    if (!fileName || typeof fileName !== "string") {
      throw new ApiError(400, "Invalid file name provided. The file name must be a non-empty string.");
    }

    const lastDotIndex = fileName.lastIndexOf(".");
    const name = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;
    const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : "";

    const sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .trim();

    const finalName = sanitized || "unnamed_file";

    return finalName + extension.toLowerCase();
  }
}