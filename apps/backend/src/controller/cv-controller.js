import { AsyncHandler } from "@heykyy/utils-backend";
import CvService from "../service/cv-service.js";

/**
 * Controller class managing Curriculum Vitae (CV) documents.
 * Orchestrates the uploading, updating, and public retrieval of professional resumes.
 */
class CvController {
  /**
   * Facilitates the creation of a new CV record.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const file = req.asset;

    const result = await CvService.create(userId, req.body, file);

    res.status(201).json({
      success: true,
      message: "CV document has been successfully registered.",
      data: result,
    });
  });

  /**
   * Updates an existing CV's metadata or replaces its associated document file.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const file = req.asset;

    const result = await CvService.update(id, req.body, file);

    res.status(200).json({
      success: true,
      message: "CV document has been successfully updated.",
      data: result,
    });
  });

  /**
   * Permanently removes a CV record and its associated storage asset.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    await CvService.delete(id);

    res.status(200).json({
      success: true,
      message: "CV document has been successfully removed.",
    });
  });

  /**
   * Retrieves a paginated list of all CV records.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isMain = req.query.isMain;
  
    const result = await CvService.gets(
      page, 
      limit, 
      search, 
      isMain
    );
  
    res.status(200).json({
      success: true,
      message: "CV collection retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });

  /**
   * Fetches the primary (main) CV designated for public display.
   * @param {import("express").Request} _req
   * @param {import("express").Response} res
   */
  getMain = AsyncHandler.catch(async (_req, res) => {
    const result = await CvService.getMain();

    res.status(200).json({
      success: true,
      message: "Primary CV retrieved successfully.",
      data: result,
    });
  });
}

export default new CvController();