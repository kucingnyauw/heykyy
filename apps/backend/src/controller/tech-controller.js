import { AsyncHandler } from "../utils/index.js";
import StackService from "../service/stack-service.js";

/**
 * Controller class for managing the technology stack and technical skills catalog.
 * Acts as the bridge for administrative CRUD operations on technical assets.
 */
class TechController {
  /**
   * Orchestrates the creation of a new technology stack entry.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  create = AsyncHandler.catch(async (req, res) => {
    const result = await StackService.create(req.body);

    res.status(201).json({
      success: true,
      message: "Technology stack has been successfully created.",
      data: result,
    });
  });

  /**
   * Updates an existing technology stack record selectively.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    const result = await StackService.update(id, req.body);

    res.status(200).json({
      success: true,
      message: "Technology stack has been successfully updated.",
      data: result,
    });
  });

  /**
   * Permanently removes a technology stack record from the system.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    await StackService.delete(id);

    res.status(200).json({
      success: true,
      message: "Technology stack has been successfully removed.",
    });
  });

  /**
   * Retrieves a paginated collection of technology stacks with search filtering.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const hasProjectOnly = req.query.hasProjectOnly === "true";
  
    const result = await StackService.gets(
      page, 
      limit, 
      search, 
      hasProjectOnly
    );
  
    res.status(200).json({
      success: true,
      message: "Technology stack collection retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });
}

export default new TechController();