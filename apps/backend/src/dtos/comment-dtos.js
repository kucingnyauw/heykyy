class CommentDto {
  constructor(comment, currentUserId, isReply = false) {
    this.id = comment.id;
    this.content = comment.content;
    this.parentId = comment.parentId;

    this.author = {
      id: comment.user?.id,
      name: comment.user?.name,
      avatar: comment.user?.profilePhoto?.url ?? null,
      role: comment.user?.role,
      bio: comment.user?.about,
    };

    this.permissions = {
      canEdit: !!currentUserId && comment.userId === currentUserId,
      canDelete:
        !!currentUserId &&
        (comment.userId === currentUserId || comment.user?.role === "ADMIN"),
    };

    this.timestamps = {
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    if (!isReply) {
      this.replies = Array.isArray(comment.replies)
        ? comment.replies.map((reply) => new CommentDto(reply, currentUserId, true))
        : [];
    }
  }
}

class CommentResponseDto {
  constructor(comments, totalAll, currentUserId) {
    this.data = comments.map((c) => new CommentDto(c, currentUserId));
    this.stats = {
      totalAll: totalAll || 0,
    };
  }
}

class CommentAdminDto {
  constructor(comment, hasAdminReply = false) {
    this.id = comment.id;
    this.content = comment.content;
    this.hasAdminReply = hasAdminReply;

    this.author = {
      id: comment.user?.id,
      name: comment.user?.name,
      avatar: comment.user?.profilePhoto?.url ?? null,
    };

    this.source = comment.blog
      ? {
          type: "BLOG",
          id: comment.blog.id,
          title: comment.blog.title,
        }
      : comment.project
      ? {
          type: "PROJECT",
          id: comment.project.id,
          title: comment.project.title,
        }
      : null;

    this.timestamps = {
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}

export { CommentDto, CommentResponseDto, CommentAdminDto };