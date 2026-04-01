import { getPrisma } from "../application/database.js";
import { ApiError, AssetUtils } from "@heykyy/utils-backend";
import { supabase } from "../lib/supabase.js";


class AssetService {
  /**
   * Retrieves the active Prisma ORM client instance.
   * * @returns {import('@prisma/client').PrismaClient} The Prisma client instance.
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Uploads a single file to Supabase storage and creates a corresponding asset record in the database.
   * Dynamically routes the file to 'uploads/img' for images or 'uploads/docs' for other file types based on its MIME type.
   * Includes an automatic rollback mechanism to clean up orphaned storage files or database records if the process fails midway.
   * * @param {string} userId - The unique identifier of the user performing the upload.
   * @param {Object} file - The file object to be uploaded.
   * @param {string} file.mimeType - The MIME type of the file (e.g., 'image/png', 'application/pdf').
   * @returns {Promise<string>} A promise that resolves to the generated public URL of the uploaded asset.
   * @throws {ApiError} Throws a 400 error if the file type is unsupported or the upload process encounters an issue.
   */
  async upload(userId, file) {
    let tempFilePath, createdAssetId;

    try {
      const isImage = file.mimeType.startsWith("image/");
      const targetFolder = isImage ? "uploads/img" : "uploads/docs";

      const uploaded = await AssetUtils.createAsset(
        supabase,
        file,
        targetFolder
      );
      tempFilePath = uploaded.storagePath;

      const asset = await this.prisma.asset.create({
        data: {
          storagePath: uploaded.storagePath,
          url: uploaded.url,
          fileName: uploaded.fileName,
          fileType: uploaded.fileType,
          fileSize: uploaded.fileSize,
          checksum: uploaded.checksum,
          userId,
        },
      });
      createdAssetId = asset.id;

      return asset.url;
    } catch (err) {
      if (tempFilePath) {
        await AssetUtils.deleteAsset(supabase, tempFilePath).catch(() => {});
      }

      if (createdAssetId) {
        await this.prisma.asset
          .delete({ where: { id: createdAssetId } })
          .catch(() => {});
      }

      if (err instanceof ApiError) throw err;
      throw new ApiError(
        400,
        "Unable to complete the asset upload. Please verify the file integrity."
      );
    }
  }
}

export default new AssetService();