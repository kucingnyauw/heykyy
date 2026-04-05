import { AsyncHandler } from "../utils/index.js";
import BlogService from "../service/blog-service.js";

/**
 * Controller class managing the lifecycle of technical articles (blogs).
 * Orchestrates traffic for content creation, updates, and public engagement.
 */
class BlogController {
  /**
   * Creates a new blog post.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const blogData = req.body;
    const file = req.asset;

    const result = await BlogService.create(userId, blogData, file);

    res.status(201).json({
      success: true,
      message: "Blog article has been successfully created.",
      data: result,
    });
  });

  /**
   * Updates an existing blog selectively.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const blogData = req.body;
    const file = req.asset;

    const result = await BlogService.update(id, userId, blogData, file);

    res.status(200).json({
      success: true,
      message: "Blog article has been successfully updated.",
      data: result,
    });
  });

  /**
   * Permanently removes a blog record.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;

    await BlogService.delete(id);

    res.status(200).json({
      success: true,
      message: "Blog article has been successfully removed.",
    });
  });

  /**
   * Retrieves a paginated list of blog posts with filters.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const status = req.query.status;
    const categoryId = req.query.categoryId;
    const isFeatured = req.query.isFeatured;
    const sortBy = req.query.sortBy;
  
    const result = await BlogService.gets(
      userId,
      page,
      limit,
      search,
      status,
      categoryId,
      isFeatured,
      sortBy
    );
  
    res.status(200).json({
      success: true,
      message: "Blog collection retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });

  /**
   * Fetches a single blog article by its slug.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  get = AsyncHandler.catch(async (req, res) => {
    const { slug } = req.params;
    const userId = req.user?.id;

    const result = await BlogService.get(slug, userId);

    res.status(200).json({
      success: true,
      message: "Blog detail retrieved successfully.",
      data: result,
    });
  });

  /**
   * Retrieves featured blogs for the landing page.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  getFeatured = AsyncHandler.catch(async (req, res) => {
    const result = await BlogService.getFeaturedBlogs();

    res.status(200).json({
      success: true,
      message: "Featured blogs retrieved successfully.",
      data: result,
    });
  });

  /**
   * Retrieves recommended/random blogs based on current slug.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  getRecommendations = AsyncHandler.catch(async (req, res) => {
    const { slug } = req.params;

    const result = await BlogService.getsRandomBlogs(slug);

    res.status(200).json({
      success: true,
      message: "Recommended blogs retrieved successfully.",
      data: result,
    });
  });

  /**
   * Toggles the 'like' status for a blog post.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  toggleLike = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await BlogService.toggleLike(userId, id);

    res.status(200).json({
      success: true,
      message: "Engagement status updated successfully.",
    });
  });
}

export default new BlogController();
