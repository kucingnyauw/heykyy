import { AsyncHandler } from "@heykyy/utils-backend";
import ProjectService from "../service/project-service.js";

/**
 * Controller class for managing the lifecycle of portfolio projects.
 * Orchestrates multi-asset uploads, case study management, and engagement metrics.
 */
class ProjectController {
  /**
   * Orchestrates the creation of a new portfolio project.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const assets = req.assets || [];

    const result = await ProjectService.create(userId, req.body, assets);

    res.status(201).json({
      success: true,
      message: "Project showcase has been successfully created.",
      data: result,
    });
  });

  /**
   * Updates an existing project entry selectively.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    const assets = req.assets || [];

    const result = await ProjectService.update(id, userId, req.body, assets);

    res.status(200).json({
      success: true,
      message: "Project showcase has been successfully updated.",
      data: result,
    });
  });

  /**
   * Permanently removes a project and its associated media assets.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    await ProjectService.delete(id);

    res.status(200).json({
      success: true,
      message: "Project showcase has been successfully removed.",
    });
  });

  /**
   * Retrieves a paginated and filtered collection of projects.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { search, status, categoryId, isFeatured, stackId, sortBy } =
      req.query;

    const result = await ProjectService.gets(
      userId,
      page,
      limit,
      search,
      status,
      categoryId,
      isFeatured,
      stackId,
      sortBy
    );

    res.status(200).json({
      success: true,
      message: "Project collection retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });

  /**
   * Retrieves recommended or random projects based on the current slug.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  getRecommendations = AsyncHandler.catch(async (req, res) => {
    const { slug } = req.params;

    const result = await ProjectService.getsRandomProject(slug);

    res.status(200).json({
      success: true,
      message: "Recommended projects retrieved successfully.",
      data: result,
    });
  });

  /**
   * Fetches detailed information for a single project by its unique slug.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  get = AsyncHandler.catch(async (req, res) => {
    const { slug } = req.params;
    const userId = req.user?.id;

    const result = await ProjectService.get(slug, userId);

    res.status(200).json({
      success: true,
      message: "Project details retrieved successfully.",
      data: result,
    });
  });

  /**
   * Retrieves high-impact featured projects for prominent site placement.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  getFeatured = AsyncHandler.catch(async (req, res) => {
    const result = await ProjectService.getFeatures();

    res.status(200).json({
      success: true,
      message: "Featured projects retrieved successfully.",
      data: result,
    });
  });

  /**
   * Toggles the engagement status (like/unlike) for a specific project.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  toggleLike = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await ProjectService.toggleLike(userId, id);

    res.status(200).json({
      success: true,
      message: "Project engagement status updated successfully.",
    });
  });
}

export default new ProjectController();
