import sharp from "sharp";
import { createHash } from "crypto";

/**
 * Utility class for managing assets in Supabase storage.
 */
export class AssetUtils {
  /**
   * Upload asset to Supabase Storage.
   * @param {Object} supabase - Supabase client instance.
   * @param {Object} asset - Asset object containing buffer, fileName, and mimeType.
   * @param {string} folder - Destination folder path (e.g., 'projects/thumbnails').
   * @returns {Promise<Object>} Uploaded asset details.
   */
  static async createAsset(supabase, asset, folder) {
    if (!supabase) throw new Error("Supabase client is required.");
    if (!asset) throw new Error("Asset data is required.");
    if (!folder) throw new Error("Target folder is required.");

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new Error("Supabase BUCKET_NAME environment variable is not defined.");
    }

    const { buffer, fileName, mimeType } = asset;

    if (!buffer || !fileName || !mimeType) {
      throw new Error("Asset must contain buffer, fileName, and mimeType.");
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
        finalFileName = fileName.split('.').slice(0, -1).join('.') + ".webp";
      }

      const checksum = createHash("sha256").update(uploadBuffer).digest("hex");

      const sanitizedFolder = folder.replace(/^\/+|\/+$/g, '');
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
        throw new Error("Could not generate public URL for the uploaded asset.");
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
      throw new Error(`Asset upload failed: ${err.message}`);
    }
  }

  /**
   * Delete asset from Supabase Storage.
   * @param {Object} supabase - Supabase client instance.
   * @param {string} path - Storage path of the asset to delete.
   * @returns {Promise<void>}
   */
  static async deleteAsset(supabase, path) {
    if (!supabase) throw new Error("Supabase client is required.");
    if (!path) throw new Error("Asset path is required for deletion.");

    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) {
      throw new Error("Supabase BUCKET_NAME environment variable is not defined.");
    }

    const cleanPath = path.replace(/^\/+/, '');

    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([cleanPath]);

      if (error) throw error;
    } catch (err) {
      /** Quiet failure for deletion to avoid breaking main application flow */
    }
  }
}