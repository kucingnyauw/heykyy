import { getPrisma } from "../application/database.js";
import { validate } from "../validation/validation.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validation/comment-validations.js";
import { PaginationUtils, ApiError } from "@heykyy/utils-backend";
import { CommentDto, CommentAdminDto } from "../dtos/comment-dtos.js";

/**
 * Service class for managing blog comments and replies.
 * Supports hierarchical threading, ownership validation, and admin management.
 */
class CommentService {
  /**
   * Provides access to the Prisma ORM client instance.
   * @returns {import("@prisma/client").PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Defines the standard database selection structure for comments, including user details and nested replies.
   * @private
   * @returns {Object}
   */
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
          about : true ,
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
              about : true ,
              profilePhoto: { select: { url: true } },
            },
          },
        },
      },
    };
  }

  /**
   * Creates a new comment or reply for a specific blog.
   *
   * @param {string} userId - The ID of the user posting the comment.
   * @param {Object} request - The comment payload (content, optional parentId).
   * @param {string} blogId - The ID of the blog being commented on.
   * @returns {Promise<CommentDto>} The newly created comment.
   * @throws {ApiError} 404 if the blog or parent comment does not exist.
   */
  async create(userId, request, blogId) {
    const payload = validate(createCommentSchema, request);

    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true },
    });

    if (!blog) {
      throw new ApiError(
        404,
        "The blog post you are trying to comment on could not be found. Please refresh and try again."
      );
    }

    let finalParentId = null;
    if (payload.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: payload.parentId },
        select: { id: true, parentId: true, blogId: true },
      });

      if (!parent || parent.blogId !== blogId) {
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
        blogId,
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

  /**
   * Updates the content of an existing comment.
   *
   * @param {string} id - The ID of the comment to update.
   * @param {string} userId - The ID of the user requesting the update.
   * @param {Object} request - The update payload (content).
   * @returns {Promise<CommentDto>} The updated comment data.
   * @throws {ApiError} 404 if not found, 403 if user is not the owner.
   */
  async update(id, userId, request) {
    const payload = validate(updateCommentSchema, request);
    const comment = await this.prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      throw new ApiError(404, "We couldn't find the comment you want to edit.");
    }
    if (comment.userId !== userId) {
      throw new ApiError(
        403,
        "You only have permission to edit your own comments."
      );
    }

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

  /**
   * Deletes a comment. Users can delete their own; Admins can delete any.
   *
   * @param {string} id - The ID of the comment to delete.
   * @param {string} userId - The ID of the user requesting deletion.
   * @returns {Promise<void>}
   * @throws {ApiError} 404 if not found, 403 if unauthorized.
   */
  async delete(id, userId) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!comment) {
      throw new ApiError(
        404,
        "The comment you're trying to delete does not exist."
      );
    }

    const requester = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (requester.role !== "ADMIN" && comment.userId !== userId) {
      throw new ApiError(
        403,
        "You do not have the required permissions to delete this comment."
      );
    }

    await this.prisma.comment.delete({ where: { id } });
  }

  /**
   * Retrieves a paginated list of top-level comments and their replies for a specific blog slug.
   *
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @param {string} slug - The slug of the blog.
   * @param {string} [currentUserId] - Optional ID of the user viewing the comments.
   * @returns {Promise<Object>} Object containing comments and pagination metadata.
   * @throws {ApiError} 404 if the blog is not found.
   */
  async gets(page, limit, slug, currentUserId) {
    const { skip, limit: take } = PaginationUtils.create({ page, limit });
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!blog) {
      throw new ApiError(
        404,
        "Unable to load comments because the blog post was not found."
      );
    }

    const where = { blogId: blog.id, parentId: null };
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
   *
   * @param {number} page - Page number.
   * @param {number} limit - Items per page.
   * @param {string} [search] - Search filter for content or username.
   * @returns {Promise<Object>} Object containing admin-view comments and metadata.
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
          { blog: { title: { contains: search, mode: "insensitive" } } }
        ],
      }),
      ...(isReplied !== undefined && {
        replies: isReplied === "true" 
          ? { some: { user: { role: "ADMIN" } } } 
          : { none: { user: { role: "ADMIN" } } }
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
