import { getPrisma } from "../application/database.js";
import { ApiError, AssetUtils, PaginationUtils } from "@heykyy/utils-backend";
import { AuthDto, ActivityDto } from "../dtos/user-dtos.js";
import { validate } from "../validation/validation.js";
import { updateUserSchema } from "../validation/user-validations.js";
import { supabase } from "../lib/supabase.js";
import { redis } from "../lib/redis.js";

/**
 * Service class to handle user-related business logic including
 * profile updates, file uploads, and activity tracking.
 */
class UserService {
  /**
   * Getter to provide the Prisma client instance.
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Clears user-related cache from Redis.
   * @param {string} email - The user's email used as part of the cache key.
   * @private
   */
  async #clearUserCaches(email) {
    try {
      const keys = `user:profile:${email}`;
      await redis.del(keys);
    } catch (err) {
      /** Cache clearing failure should not block the main process */
    }
  }

  /**
   * Standard selection object for User queries.
   * Note: This matches the fields retrieved by authMiddleware for consistency.
   * @private
   */
  get #userSelect() {
    return {
      id: true,
      email: true,
      name: true,
      about: true,
      role: true,
      profilePhoto: { select: { url: true } },
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Uploads a file to Supabase storage and creates an Asset record in the database.
   * @param {Express.Multer.File} file - The file object to upload.
   * @param {string} userId - The ID of the user owning the file.
   * @returns {Promise<{asset: Object, path: string} | null>}
   * @throws {ApiError} If the upload process fails.
   */
  async uploadFile(file, userId) {
    if (!file) return null;

    const uploaded = await AssetUtils.createAsset(
      supabase,
      file,
      `avatars/${userId}`
    );

    if (!uploaded) {
      throw new ApiError(500, "Failed to upload profile picture to storage.");
    }

    const asset = await this.prisma.asset.create({
      data: {
        storagePath: uploaded.storagePath,
        url: uploaded.url,
        fileName: uploaded.fileName,
        fileType: uploaded.fileType,
        fileSize: uploaded.fileSize,
        checksum: uploaded.checksum,
      },
    });

    return { asset, path: uploaded.storagePath };
  }

  /**
   * Retrieves the current authenticated user details.
   * @param {Object} user - The user object from request.
   * @returns {Promise<AuthDto>}
   */
  async getCurrentUser(user) {
    return new AuthDto(user);
  }

  /**
   * Updates user profile information and handles profile picture replacement.
   * @param {string} userId - ID of the user to update.
   * @param {Object} request - The update payload.
   * @param {Express.Multer.File} [file] - Optional new profile picture.
   * @returns {Promise<AuthDto>}
   * @throws {ApiError} If user not found or update fails.
   */
  async updateUser(userId, request, file) {
    let tempFilePath;
    let createdAssetId;

    try {
      const payload = validate(updateUserSchema, request);
      const existingUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profilePhoto: true },
      });

      if (!existingUser) {
        throw new ApiError(404, "User profile not found.");
      }

      let newAssetId = existingUser.profilePhotoId;

      if (file) {
        const uploadResult = await this.uploadFile(file, userId);
        tempFilePath = uploadResult.path;
        createdAssetId = uploadResult.asset.id;
        newAssetId = createdAssetId;
      }

      const updatedUser = await this.prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            name: payload.name ?? existingUser.name,
            about: payload.about ?? existingUser.about,
            profilePhotoId: newAssetId,
          },
          select: this.#userSelect,
        });

        /** Cleanup old assets from storage and database if a replacement was uploaded */
        if (file && existingUser.profilePhoto) {
          await AssetUtils.deleteAsset(
            supabase,
            existingUser.profilePhoto.storagePath
          ).catch(() => {});

          await tx.asset
            .delete({ where: { id: existingUser.profilePhotoId } })
            .catch(() => {});
        }

        return user;
      });

      await this.#clearUserCaches(existingUser.email);
      return new AuthDto(updatedUser);
    } catch (err) {
      /** Rollback: Delete temporary file and database record if the transaction fails */
      if (tempFilePath)
        await AssetUtils.deleteAsset(supabase, tempFilePath).catch(() => {});
      if (createdAssetId)
        await this.prisma.asset
          .delete({ where: { id: createdAssetId } })
          .catch(() => {});

      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        "An unexpected error occurred while updating the profile."
      );
    }
  }

  /**
   * Fetches recent activities (comments, likes, posts) for a specific user.
   * @param {string} userId - ID of the user.
   * @returns {Promise<ActivityDto[]>} List of recent activities.
   * @throws {ApiError} If user is not found.
   */
  async getUserActivity(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user) {
      throw new ApiError(404, "User account not found.");
    }

    const baseUrl = process.env.FRONTEND_URL;
    const isAdmin = user.role === "ADMIN" || user.role === "ASSISTANT";

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dataQueries = [
      this.prisma.comment.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        include: { blog: { select: { title: true, slug: true } } },
      }),
      this.prisma.blogLike.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        include: { blog: { select: { title: true, slug: true } } },
      }),
      this.prisma.projectLike.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "desc" },
        include: { project: { select: { title: true, slug: true } } },
      }),
    ];

    if (isAdmin) {
      dataQueries.push(
        this.prisma.blog.findMany({
          where: { authorId: userId, createdAt: { gte: sevenDaysAgo } },
          select: { title: true, slug: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        }),
        this.prisma.project.findMany({
          where: { authorId: userId, createdAt: { gte: sevenDaysAgo } },
          select: { title: true, slug: true, createdAt: true },
          orderBy: { createdAt: "desc" },
        })
      );
    }

    const dataResults = await Promise.all(dataQueries);

    const comments = dataResults[0] ?? [];
    const blogLikes = dataResults[1] ?? [];
    const projectLikes = dataResults[2] ?? [];
    const blogs = dataResults[3] ?? [];
    const projects = dataResults[4] ?? [];

    const rawActivities = [
      ...comments.map((i) => ({
        timestamp: i.createdAt,
        sentence: `You commented on the blog "${i.blog.title}"`,
        url: `${baseUrl}/blog/${i.blog.slug}`,
      })),
      ...blogLikes.map((i) => ({
        timestamp: i.createdAt,
        sentence: `You liked the article "${i.blog.title}"`,
        url: `${baseUrl}/blog/${i.blog.slug}`,
      })),
      ...projectLikes.map((i) => ({
        timestamp: i.createdAt,
        sentence: `You liked the project "${i.project.title}"`,
        url: `${baseUrl}/project/${i.project.slug}`,
      })),
      ...(isAdmin
        ? blogs.map((i) => ({
            timestamp: i.createdAt,
            sentence: `You published a new blog "${i.title}"`,
            url: `${baseUrl}/blog/${i.slug}`,
          }))
        : []),
      ...(isAdmin
        ? projects.map((i) => ({
            timestamp: i.createdAt,
            sentence: `You created a new project "${i.title}"`,
            url: `${baseUrl}/project/${i.slug}`,
          }))
        : []),
    ];

    const activities = rawActivities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    return activities.map((act) => new ActivityDto(act));
  }
}

export default new UserService();