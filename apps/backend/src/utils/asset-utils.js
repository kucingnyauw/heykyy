import { createHash } from "crypto";
import sharp from "sharp";

import { ApiError } from "./error-utils.js";

/**
 * Utility class for managing assets in Supabase storage.
 * Handles image optimization, file uploads, and deletion with integrity checks.
 */
export class AssetUtils {
  /**
   * Upload asset to Supabase Storage with optional image optimization.
   * * @param {Object} supabase - Supabase client instance.
   * @param {Object} asset - Asset object.
   * @param {Buffer} asset.buffer - The raw file buffer.
   * @param {string} asset.fileName - Original name of the file.
   * @param {string} asset.mimeType - MIME type of the file.
   * @param {string} folder - Destination folder path in the bucket.
   * @returns {Promise<Object>} Object containing uploaded asset details.
   * @throws {ApiError} 400 - If parameters are missing.
   * @throws {ApiError} 500 - If upload or environment configuration fails.
   */
  static async createAsset(supabase, asset, folder) {
    if (!supabase) throw new ApiError(500, "Supabase client is required for asset operations.");
    if (!asset) throw new ApiError(400, "Asset data payload is required.");
    if (!folder) throw new ApiError(400, "Target storage folder is required.");

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new ApiError(500, "Storage configuration error: BUCKET_NAME is not defined.");
    }

    const { buffer, fileName, mimeType } = asset;

    if (!buffer || !fileName || !mimeType) {
      throw new ApiError(400, "Asset must contain valid buffer, fileName, and mimeType.");
    }

    try {
      let uploadBuffer = buffer;
      let finalFileName = fileName;
      let finalMimeType = mimeType;

      if (mimeType.startsWith("image/")) {
        uploadBuffer = await sharp(buffer)
          .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();

        finalMimeType = "image/webp";
        const baseName = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
        finalFileName = `${baseName}.webp`;
      }

      const checksum = createHash("sha256").update(uploadBuffer).digest("hex");
      const sanitizedFolder = folder.replace(/^\/+|\/+$/g, "");
      const storagePath = `${sanitizedFolder}/${finalFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, uploadBuffer, {
          contentType: finalMimeType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from(bucketName)
        .getPublicUrl(storagePath);

      if (!data?.publicUrl) {
        throw new ApiError(500, "Failed to generate public access URL for the uploaded asset.");
      }

      return {
        storagePath,
        url: data.publicUrl,
        fileName: finalFileName,
        fileType: finalMimeType,
        fileSize: uploadBuffer.length,
        checksum,
      };
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, `Asset upload failed: ${err.message}`);
    }
  }

  /**
   * Deletes an asset from Supabase Storage.
   * * @param {Object} supabase - Supabase client instance.
   * @param {string} path - The storage path of the asset to be removed.
   * @returns {Promise<void>}
   * @throws {ApiError} 500 - If deletion fails (unless suppressed).
   */
  static async deleteAsset(supabase, path) {
    if (!supabase) throw new ApiError(500, "Supabase client is required for deletion.");
    if (!path) throw new ApiError(400, "Asset storage path is required for deletion.");

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new ApiError(500, "Storage configuration error: BUCKET_NAME is not defined.");
    }

    const cleanPath = path.replace(/^\/+/, "");

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([cleanPath]);

      if (error) throw error;
    } catch (err) {
      /** Catch-all to prevent deletion errors from interrupting core application workflows */
    }
  }
}