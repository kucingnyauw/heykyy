import { getPrisma } from "../application/database.js";
import { validate } from "../validation/validation.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validation/comment-validations.js";
import { ApiError, PaginationUtils } from "../utils/index.js";
import { CommentDto, CommentAdminDto } from "../dtos/comment-dtos.js";

class CommentService {
  get prisma() {
    return getPrisma();
  }

  get #commentSelect() {
    return {
      id: true,
      content: true,
      parentId: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          role: true,
          about: true,
          profilePhoto: { select: { url: true } },
        },
      },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          content: true,
          parentId: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              role: true,
              about: true,
              profilePhoto: { select: { url: true } },
            },
          },
        },
      },
    };
  }

  /**
   * Creates a new comment or reply.
   * Target type determines if it belongs to a Blog or a Project.
   */
  async create(userId, request, targetId, targetType = "BLOG") {
    const payload = validate(createCommentSchema, request);
    const isBlog = targetType === "BLOG";

    // Dinamis menentukan model mana yang akan dicek (Blog atau Project)
    const targetModel = isBlog ? this.prisma.blog : this.prisma.project;
    const target = await targetModel.findUnique({
      where: { id: targetId },
      select: { id: true },
    });

    if (!target) {
      throw new ApiError(
        404,
        `The ${isBlog ? "blog post" : "project"} you are trying to comment on could not be found.`
      );
    }

    let finalParentId = null;
    if (payload.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: payload.parentId },
        select: { id: true, parentId: true, blogId: true, projectId: true },
      });

      // Pastikan parent comment berada di target yang sama (blog/project yg sama)
      const isParentValid = isBlog
        ? parent?.blogId === targetId
        : parent?.projectId === targetId;

      if (!parent || !isParentValid) {
        throw new ApiError(
          404,
          "The comment you are trying to reply to no longer exists or belongs to a different post."
        );
      }

      finalParentId = parent.parentId ?? parent.id;
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: payload.content,
        userId,
        blogId: isBlog ? targetId : null,
        projectId: !isBlog ? targetId : null,
        parentId: finalParentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePhoto: { select: { url: true } },
          },
        },
      },
    });

    return new CommentDto(comment, userId);
  }

  async update(id, userId, request) {
    const payload = validate(updateCommentSchema, request);
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) throw new ApiError(404, "We couldn't find the comment you want to edit.");
    if (comment.userId !== userId) throw new ApiError(403, "You only have permission to edit your own comments.");

    const updated = await this.prisma.comment.update({
      where: { id },
      data: { content: payload.content },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
            profilePhoto: { select: { url: true } },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                role: true,
                profilePhoto: { select: { url: true } },
              },
            },
          },
        },
      },
    });

    return new CommentDto(updated, userId);
  }

  async delete(id, userId) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!comment) throw new ApiError(404, "The comment you're trying to delete does not exist.");

    const requester = await this.prisma.user.findUnique({ where: { id: userId } });

    if (requester.role !== "ADMIN" && comment.userId !== userId) {
      throw new ApiError(403, "You do not have the required permissions to delete this comment.");
    }

    await this.prisma.comment.delete({ where: { id } });
  }

  /**
   * Mengambil list komentar berdasarkan slug target (Blog/Project).
   */
  async gets(page, limit, slug, targetType = "BLOG", currentUserId) {
    const { skip, limit: take } = PaginationUtils.create({ page, limit });
    const isBlog = targetType === "BLOG";

    const targetModel = isBlog ? this.prisma.blog : this.prisma.project;
    const target = await targetModel.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!target) {
      throw new ApiError(
        404,
        `Unable to load comments because the ${isBlog ? "blog post" : "project"} was not found.`
      );
    }

 
    const where = {
      parentId: null,
      ...(isBlog ? { blogId: target.id } : { projectId: target.id }),
    };

    const [total, comments] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "asc" },
        select: this.#commentSelect,
      }),
    ]);

    return {
      data: comments.map((c) => new CommentDto(c, currentUserId)),
      metadata: PaginationUtils.generateMetadata(total, page, take),
    };
  }

  /**
   * Retrieves all user comments for the admin management panel.
   */
  async getsAll(page, limit, search, isReplied) {
    const { skip, limit: take } = PaginationUtils.create({ page, limit });

    const where = {
      user: { role: "USER" },
      parentId: null,
      ...(search && {
        OR: [
          { content: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { blog: { title: { contains: search, mode: "insensitive" } } },
          { project: { title: { contains: search, mode: "insensitive" } } }, // Ditambah untuk project
        ],
      }),
      ...(isReplied !== undefined && {
        replies:
          isReplied === "true"
            ? { some: { user: { role: "ADMIN" } } }
            : { none: { user: { role: "ADMIN" } } },
      }),
    };

    const [total, comments] = await Promise.all([
      this.prisma.comment.count({ where }),
      this.prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              profilePhoto: { select: { url: true } },
            },
          },

          blog: { select: { id: true, title: true, slug: true } },
          project: { select: { id: true, title: true, slug: true } },
          _count: {
            select: {
              replies: { where: { user: { role: "ADMIN" } } },
            },
          },
        },
      }),
    ]);

    return {
      data: comments.map((c) => new CommentAdminDto(c, c._count.replies > 0)),
      metadata: PaginationUtils.generateMetadata(total, page, take),
    };
  }
}

export default new CommentService();