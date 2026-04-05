import { AsyncHandler } from "../utils/index.js";
import AssetService from "../service/asset-service.js";

class AssetController {
  /**
   * Handles the HTTP request for uploading a new standalone asset.
   * Extracts the authenticated user's ID and the parsed file from the request, 
   * delegates the upload process to the AssetService, and returns a standardized JSON response.
   * * @param {import('express').Request} req - The Express request object containing `req.user` and `req.asset`.
   * @param {import('express').Response} res - The Express response object used to send the JSON payload.
   * @returns {Promise<void>} Sends a 201 Created response containing the uploaded asset's public URL.
   */
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const file = req.asset;
    const response = await AssetService.upload(userId, file);

    res.status(201).json({
      success: true,
      message: "Asset uploaded successfully.",
      data: response,
    });
  });
}

export default new AssetController();