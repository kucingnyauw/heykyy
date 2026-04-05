import { AsyncHandler } from "../utils/index.js";
import CommentService from "../service/comment-service.js";

class CommentController {
  create = AsyncHandler.catch(async (req, res) => {
    const userId = req.user.id;
    const { id } = req.params;
    
    const targetType = req.query.targetType?.toUpperCase() || "BLOG";

    const result = await CommentService.create(userId, req.body, id, targetType);

    res.status(201).json({
      success: true,
      message: `Comment has been successfully posted to ${targetType.toLowerCase()}.`,
      data: result,
    });
  });

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

  delete = AsyncHandler.catch(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await CommentService.delete(id, userId);

    res.status(200).json({
      success: true,
      message: "Comment has been successfully removed.",
    });
  });

  gets = AsyncHandler.catch(async (req, res) => {
    const currentUserId = req.user?.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { slug } = req.query;
    
    const targetType = req.query.targetType?.toUpperCase() || "BLOG";

    const result = await CommentService.gets(page, limit, slug, targetType, currentUserId);

    res.status(200).json({
      success: true,
      message: `${targetType.toLowerCase()} comment thread retrieved successfully.`,
      data: result.data,
      metadata: result.metadata,
    });
  });

  getsMonitor = AsyncHandler.catch(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const isReplied = req.query.isReplied;
  
    const result = await CommentService.getsAll(page, limit, search, isReplied);
  
    res.status(200).json({
      success: true,
      message: "Global comment audit list retrieved successfully.",
      data: result.data,
      metadata: result.metadata,
    });
  });
}

export default new CommentController();