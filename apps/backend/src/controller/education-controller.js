import { AsyncHandler } from "../utils/index.js";
import EducationService from "../service/education-service.js";

/**
 * Controller class for managing educational background records.
 */
class EducationController {
  /**
   * Creates a new education entry.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;

    const result = await EducationService.create(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Education record has been successfully created.",
      data: result,
    });
  });

  /**
   * Updates an existing education record selectively.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await EducationService.update(userId, id, req.body);

    res.status(200).json({
      success: true,
      message: "Education record has been successfully updated.",
      data: result,
    });
  });

  /**
   * Permanently removes an education record.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    await EducationService.delete(userId, id);

    res.status(200).json({
      success: true,
      message: "Education record has been successfully removed.",
    });
  });

  /**
   * Retrieves a paginated list of education history.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isCurrent = req.query.isCurrent;
  
    const result = await EducationService.gets(
      page, 
      limit, 
      search, 
      isCurrent
    );
  
    res.status(200).json({
      success: true,
      message: "Education history retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });
}

export default new EducationController();