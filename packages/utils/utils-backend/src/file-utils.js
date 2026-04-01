
/**
 * Sanitizes a file name by:
 * - Removing unsafe characters
 * - Replacing spaces with underscores
 * - Preserving the original file extension
 *
 * @param {string} fileName - The original file name
 * @returns {string} Sanitized file name
 */
export const sanitizeFileName = (fileName) => {
  if (!fileName || typeof fileName !== "string") {
    throw new Error("Invalid fileName provided");
  }

  const lastDotIndex = fileName.lastIndexOf(".");
  const name = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;
  const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex) : "";

  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "_")
    .replace(/_+/g, "_")
    .trim();

  return sanitized + extension.toLowerCase();
};
