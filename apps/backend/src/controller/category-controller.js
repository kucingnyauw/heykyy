import { AsyncHandler } from "../utils/index.js";
import CategoryService from "../service/category-service.js";

/**
 * Controller class managing taxonomy and categorization for both Blogs and Projects.
 * Bridges HTTP traffic to the CategoryService for administrative and public operations.
 */
class CategoryController {
  /**
   * Facilitates the creation of a new category entry.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  create = AsyncHandler.catch(async (req, res) => {
    const result = await CategoryService.create(req.body);

    res.status(201).json({
      success: true,
      message: "Category has been successfully created.",
      data: result,
    });
  });

  /**
   * Updates metadata for an existing category selectively.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    const result = await CategoryService.update(id, req.body);

    res.status(200).json({
      success: true,
      message: "Category has been successfully updated.",
      data: result,
    });
  });

  /**
   * Permanently removes a category record from the catalog.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    await CategoryService.delete(id);

    res.status(200).json({
      success: true,
      message: "Category has been successfully removed.",
    });
  });

  /**
   * Retrieves a paginated list of categories filtered by type (BLOG/PROJECT).
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const type = req.query.type;
    const sortBy = req.query.sortBy;
    const hasContentOnly = req.query.hasContentOnly === "true";

    const result = await CategoryService.gets(
      userId,
      page,
      limit,
      search,
      type,
      sortBy,
      hasContentOnly
    );

    res.status(200).json({
      success: true,
      message: "Category collection retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });
}

export default new CategoryController();
