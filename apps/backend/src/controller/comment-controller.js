import { AsyncHandler } from "@heykyy/utils-backend";
import CommentService from "../service/comment-service.js";

/**
 * Controller class for managing user discussions and engagement via comments.
 */
class CommentController {
  /**
   * Facilitates the creation of a new comment.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await CommentService.create(userId, req.body, id);

    res.status(201).json({
      success: true,
      message: "Comment has been successfully posted.",
      data: result,
    });
  });

  /**
   * Updates an existing comment.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  update = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await CommentService.update(id, userId, req.body);

    res.status(200).json({
      success: true,
      message: "Comment has been successfully modified.",
      data: result,
    });
  });

  /**
   * Permanently removes a comment record.
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   */
  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await CommentService.delete(id, userId);

    res.status(200).json({
      success: true,
      message: "Comment has been successfully removed.",
    });
  });

  /**
   * Retrieves a paginated list of comments for a specific content slug.
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const currentUserId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { slug } = req.query;

    const result = await CommentService.gets(page, limit, slug, currentUserId);

    res.status(200).json({
      success: true,
      message: "Comment thread retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });

  /**
   * Global monitoring endpoint for administrative review.
   */
  getsMonitor = AsyncHandler.catch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isReplied = req.query.isReplied;
  
    const result = await CommentService.getsAll(
      page, 
      limit, 
      search, 
      isReplied
    );
  
    res.status(200).json({
      success: true,
      message: "Global comment audit list retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });
}

export default new CommentController();