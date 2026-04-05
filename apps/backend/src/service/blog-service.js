import axios from "axios";
import slugify from "slugify";
import { getPrisma } from "../application/database.js";
import { BlogDto, BlogListDto } from "../dtos/blog-dtos.js";
import { redis } from "../lib/redis.js";
import { supabase } from "../lib/supabase.js";
import { ApiError, AssetUtils, PaginationUtils } from "../utils/index.js";
import {
  createBlogSchema,
  updateBlogSchema,
} from "../validation/blog-validations.js";
import { convert } from "html-to-text";
import { validate } from "../validation/validation.js";
import { DEFAULT_CACHE_TTL } from "@heykyy/constant";

/**
 * Service class for managing blog operations.
 * Optimized to handle long-running TTS processes outside of database transactions.
 */
class BlogService {
  /**
   * Provides access to the Prisma client instance.
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Clears blog-related cache keys from Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearBlogCaches() {
    try {
      const keys = await redis.keys("blogs:list:*");
      if (keys.length > 0) await redis.del(...keys);
      await redis.del("blogs:featured");
    } catch (err) {}
  }

  /**
   * Splits text into manageable chunks for TTS processing.
   * @private
   * @param {string} text - The input text.
   * @param {number} [maxLength=1500] - Maximum length of each chunk.
   * @returns {string[]}
   */
  #splitText(text, maxLength = 1500) {
    const chunks = [];
    let currentChunk = "";
    const sentences = text.split(/(?<=[.?!])\s+/);

    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength) {
        currentChunk += (currentChunk ? " " : "") + sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk);
    return chunks;
  }

  /**
   * Converts HTML to speech and uploads to storage.
   * @private
   * @param {string} htmlContent - HTML to convert.
   * @param {string} userId - Owner ID.
   * @param {string} fileName - Base filename.
   * @returns {Promise<{assetId: string|null}>}
   */
  async #generateAndUploadAudio(htmlContent, userId, fileName) {
    try {
      const cleanText = convert(htmlContent, {
        wordwrap: false,
        selectors: [
          {
            selector: "h1",
            format: "inline",
            options: { postfixed: " . . . . . " },
          },
          {
            selector: "h2",
            format: "inline",
            options: { postfixed: " . . . . " },
          },
          {
            selector: "h3",
            format: "inline",
            options: { postfixed: " . . . " },
          },
          { selector: "li", format: "inline", options: { prefix: " . " } },
          { selector: "a", options: { ignoreHref: true } },
          { selector: "img", format: "skip" },
          { selector: "code", format: "skip" },
          { selector: "pre", format: "skip" },
        ],
      })
        .replace(/\n\s*\n/g, " . ")
        .replace(/\n/g, " . ")
        .replace(/\s+/g, " ")
        .trim();

      const textChunks = this.#splitText(cleanText);

      const audioBuffers = await Promise.all(
        textChunks.map(async (chunk) => {
          const response = await axios.post(
            "https://api.deepgram.com/v1/speak?model=aura-2-apollo-en&speaking_rate=0.85",
            { text: chunk },
            {
              headers: {
                Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                "Content-Type": "application/json",
              },
              responseType: "arraybuffer",
            }
          );
          return Buffer.from(response.data);
        })
      );

      const finalBuffer = Buffer.concat(audioBuffers);
      const audioAssetRequest = {
        buffer: finalBuffer,
        fileName: `blog-${fileName}-${Date.now()}-${Math.floor(
          Math.random() * 1000
        )}.mp3`,
        mimeType: "audio/mpeg",
      };

      const uploadedAsset = await AssetUtils.createAsset(
        supabase,
        audioAssetRequest,
        "blogs/audios"
      );

      const asset = await this.prisma.asset.create({
        data: { ...uploadedAsset, userId },
      });

      return { assetId: asset.id };
    } catch (err) {
      return { assetId: null };
    }
  }

  /**
   * Data selection for detailed blog view.
   * @private
   */
  get #blogDetailSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      summary: true,
      status: true,
      tags: true,
      likeCount: true,
      viewCount: true,
      metaTitle: true,
      metaDesc: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          name: true,
          about: true,
          profilePhoto: { select: { url: true } },
          role: true,
        },
      },
      category: { select: { id: true, name: true } },
      thumbnail: { select: { id: true, url: true, storagePath: true } },
      audio: { select: { id: true, url: true, storagePath: true } },
      detail: { select: { contentHtml: true } },
    };
  }

  /**
   * Data selection for blog list view.
   * @private
   */
  get #blogListSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      summary: true,
      status: true,
      viewCount: true,
      likeCount: true,
      isFeatured: true,
      tags: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: { name: true, profilePhoto: { select: { url: true } } },
      },
      category: { select: { name: true } },
      thumbnail: { select: { url: true } },
    };
  }

  /**
   * Creates a new blog post.
   * @param {string} userId - Author ID.
   * @param {Object} request - Blog payload.
   * @param {Object} [file] - Thumbnail file.
   * @returns {Promise<BlogDto>}
   */
  async create(userId, request, file) {
    let uploadedAsset = null;
    let audioAssetId = null;

    try {
      const payload = validate(createBlogSchema, request);
      const slug = slugify(payload.title, { lower: true, strict: true });

      if (file) {
        uploadedAsset = await AssetUtils.createAsset(
          supabase,
          file,
          "blogs/thumbnails"
        );
      }

      if (payload.status === "PUBLISHED" && payload.contentHtml) {
        const audioResult = await this.#generateAndUploadAudio(
          payload.contentHtml,
          userId,
          slug
        );
        audioAssetId = audioResult.assetId;
      }

      const result = await this.prisma.$transaction(async (tx) => {
        let thumbnailId = null;
        if (uploadedAsset) {
          const asset = await tx.asset.create({
            data: { ...uploadedAsset, userId },
          });
          thumbnailId = asset.id;
        }

        return await tx.blog.create({
          data: {
            title: payload.title,
            slug,
            summary: payload.summary,
            status: payload.status,
            tags: payload.tags,
            metaTitle: payload.metaTitle,
            metaDesc: payload.metaDesc,
            isFeatured: payload.isFeatured,
            author: { connect: { id: userId } },
            category: payload.categoryId
              ? { connect: { id: payload.categoryId } }
              : undefined,
            thumbnail: thumbnailId
              ? { connect: { id: thumbnailId } }
              : undefined,
            audio: audioAssetId ? { connect: { id: audioAssetId } } : undefined,
            detail: { create: { contentHtml: payload.contentHtml || "" } },
          },
        });
      });

      await this.#clearBlogCaches();
      return this.get(result.slug, userId);
    } catch (err) {
      if (uploadedAsset?.storagePath) {
        await AssetUtils.deleteAsset(supabase, uploadedAsset.storagePath).catch(
          () => {}
        );
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, `Failed to create blog: ${err.message}`);
    }
  }

  /**
   * Updates an existing blog post.
   * @param {string} id - Blog ID.
   * @param {string} userId - Editor ID.
   * @param {Object} request - Updated fields.
   * @param {Object} [file] - New thumbnail file.
   * @returns {Promise<BlogDto>}
   */
  async update(id, userId, request, file) {
    let newUploadedAsset = null;
    let newAudioAssetId = null;
    const payload = validate(updateBlogSchema, request);

    const existing = await this.prisma.blog.findUnique({
      where: { id },
      include: { detail: true, thumbnail: true, audio: true },
    });

    if (!existing) throw new ApiError(404, "Blog post not found.");

    try {
      const updateData = {};
      const fields = [
        "title",
        "summary",
        "status",
        "tags",
        "isFeatured",
        "metaTitle",
        "metaDesc",
      ];

      fields.forEach((field) => {
        if (
          payload[field] !== undefined &&
          payload[field] !== existing[field]
        ) {
          updateData[field] = payload[field];
        }
      });

      if (updateData.title) {
        updateData.slug = slugify(updateData.title, {
          lower: true,
          strict: true,
        });
      }

      if (file) {
        newUploadedAsset = await AssetUtils.createAsset(
          supabase,
          file,
          "blogs/thumbnails"
        );
      }

      const detailUpdate = {};

      if (payload.contentHtml !== undefined) {
        const cleanedHtml = (payload.contentHtml || "")
          .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>|\u200B)*<\/p>/gi, "")
          .trim();

        if (cleanedHtml !== (existing.detail?.contentHtml || "")) {
          detailUpdate.contentHtml = cleanedHtml;

          const normalize = (html) =>
            (html || "")
              .replace(/<p>(?:\s|&nbsp;|<br\s*\/?>|\u200B)*<\/p>/gi, "")
              .replace(/\s+/g, " ")
              .trim();

          const normalizedNew = normalize(cleanedHtml);
          const normalizedOld = normalize(existing.detail?.contentHtml);

          if (
            normalizedNew !== normalizedOld &&
            (payload.status || existing.status) === "PUBLISHED"
          ) {
            const audioResult = await this.#generateAndUploadAudio(
              cleanedHtml,
              userId,
              updateData.slug || existing.slug
            );

            if (audioResult.assetId) {
              newAudioAssetId = audioResult.assetId;
            }
          }
        }
      }

      const result = await this.prisma.$transaction(async (tx) => {
        if (newUploadedAsset) {
          const asset = await tx.asset.create({
            data: { ...newUploadedAsset, userId },
          });

          if (existing.thumbnail) {
            await AssetUtils.deleteAsset(
              supabase,
              existing.thumbnail.storagePath
            ).catch(() => {});
            await tx.asset.delete({ where: { id: existing.thumbnail.id } });
          }
          updateData.thumbnail = { connect: { id: asset.id } };
        }

        if (newAudioAssetId) {
          if (existing.audio) {
            await AssetUtils.deleteAsset(
              supabase,
              existing.audio.storagePath
            ).catch(() => {});
            await tx.asset
              .delete({ where: { id: existing.audio.id } })
              .catch(() => {});
          }
          updateData.audio = { connect: { id: newAudioAssetId } };
        }

        return await tx.blog.update({
          where: { id },
          data: {
            ...updateData,
            category:
              payload.categoryId !== undefined
                ? payload.categoryId
                  ? { connect: { id: payload.categoryId } }
                  : { disconnect: true }
                : undefined,
            detail:
              Object.keys(detailUpdate).length > 0
                ? { update: detailUpdate }
                : undefined,
          },
        });
      });

      await this.#clearBlogCaches();
      return this.get(result.slug, userId);
    } catch (err) {
      if (newUploadedAsset?.storagePath) {
        await AssetUtils.deleteAsset(
          supabase,
          newUploadedAsset.storagePath
        ).catch(() => {});
      }
      if (err instanceof ApiError) throw err;
      throw new ApiError(500, `Failed to update blog: ${err.message}`);
    }
  }

  /**
   * Retrieves a blog post by slug.
   * @param {string} slug - Blog slug.
   * @param {string} [userId] - Current user ID.
   * @returns {Promise<BlogDto>}
   */
  async get(slug, userId) {
    const [blog, user] = await Promise.all([
      this.prisma.blog.findUnique({
        where: { slug },
        select: this.#blogDetailSelect,
      }),
      userId
        ? this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          })
        : null,
    ]);

    if (!blog) throw new ApiError(404, "Blog post not found.");

    const isAdmin = user?.role === "ADMIN";
    if (blog.status !== "PUBLISHED" && !isAdmin) {
      throw new ApiError(403, "Access denied.");
    }

    if (!isAdmin) {
      this.prisma.blog
        .update({
          where: { id: blog.id },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    const [likedByMe, commentCount] = await Promise.all([
      userId
        ? this.prisma.blogLike.findUnique({
            where: { blogId_userId: { blogId: blog.id, userId } },
          })
        : null,
      this.prisma.comment.count({ where: { blogId: blog.id } }),
    ]);

    return new BlogDto(blog, Boolean(likedByMe), commentCount);
  }

  /**
   * Retrieves paginated blog list.
   * @param {string} userId - User context ID.
   * @param {number} page - Current page.
   * @param {number} limit - Items per page.
   * @param {string} [search] - Search term.
   * @param {string} [status] - Filter by status.
   * @param {string} [categoryId] - Filter by category.
   * @param {boolean} [isFeatured] - Filter featured.
   * @param {string} [sortBy] - Sort order.
   * @returns {Promise<Object>}
   */
  async gets(
    userId,
    page,
    limit,
    search,
    status,
    categoryId,
    isFeatured,
    sortBy = "latest"
  ) {
    const isAdmin = userId
      ? await this.prisma.user
          .findUnique({ where: { id: userId }, select: { role: true } })
          .then((u) => u?.role === "ADMIN")
      : false;

    const cacheKey = `blogs:list:${
      isAdmin ? `admin:${userId}` : "public"
    }:${page}:${limit}:${search || ""}:${status || ""}:${categoryId || ""}:${
      isFeatured || ""
    }:${sortBy}`;

    const cached = await redis.get(cacheKey);
    if (cached) return typeof cached === "string" ? JSON.parse(cached) : cached;

    const { skip, limit: take } = PaginationUtils.create({ page, limit });
    const where = {
      ...(isAdmin ? (status ? { status } : {}) : { status: "PUBLISHED" }),
      ...(search && {
        OR: [{ title: { contains: search, mode: "insensitive" } }],
      }),
      ...(categoryId && { categoryId }),
      ...(isFeatured !== undefined && {
        isFeatured: isFeatured === "true" || isFeatured === true,
      }),
    };

    const orderMapping = {
      latest: { createdAt: "desc" },
      oldest: { createdAt: "asc" },
      popular: { viewCount: "desc" },
      most_liked: { likeCount: "desc" },
    };

    const [total, blogs] = await Promise.all([
      this.prisma.blog.count({ where }),
      this.prisma.blog.findMany({
        where,
        skip,
        take,
        orderBy: orderMapping[sortBy] || orderMapping.latest,
        select: this.#blogListSelect,
      }),
    ]);

    const result = {
      data: blogs.map((b) => new BlogListDto(b)),
      metadata: PaginationUtils.generateMetadata(total, page, take),
    };

    await redis.set(cacheKey, JSON.stringify(result), {
      ex: DEFAULT_CACHE_TTL,
    });
    return result;
  }

  /**
   * Deletes a blog post and its assets.
   * @param {string} id - Blog ID.
   * @returns {Promise<void>}
   */
  async delete(id) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { thumbnail: true, audio: true },
    });

    if (!blog) throw new ApiError(404, "Blog not found.");

    const assetsToDelete = [blog.thumbnail, blog.audio].filter(Boolean);
    for (const asset of assetsToDelete) {
      await AssetUtils.deleteAsset(supabase, asset.storagePath).catch(() => {});
    }

    await this.prisma.blog.delete({ where: { id } });
    await this.#clearBlogCaches();
  }

  /**
   * Gets featured blog posts.
   * @returns {Promise<BlogListDto[]>}
   */
  async getFeaturedBlogs() {
    const blogs = await this.prisma.blog.findMany({
      take: 3,
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { createdAt: "desc" },
      select: this.#blogListSelect,
    });
    return blogs.map((b) => new BlogListDto(b));
  }

  /**
   * Gets random blog posts.
   * @param {string} slug - Slug to exclude.
   * @returns {Promise<BlogListDto[]>}
   */
  async getsRandomBlogs(slug) {
    const take = 4;
    const where = { slug: { not: slug }, status: "PUBLISHED" };
    const total = await this.prisma.blog.count({ where });
    if (total === 0) return [];

    const skip = Math.floor(Math.random() * Math.max(total - take + 1, 1));
    const blogs = await this.prisma.blog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: this.#blogListSelect,
    });
    return blogs.map((b) => new BlogListDto(b));
  }

  /**
   * Toggles like status on a blog.
   * @param {string} userId - User ID.
   * @param {string} blogId - Blog ID.
   * @returns {Promise<void>}
   */
  async toggleLike(userId, blogId) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new ApiError(404, "Blog post not found.");

    const existingLike = await this.prisma.blogLike.findUnique({
      where: { blogId_userId: { blogId, userId } },
    });

    await this.prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.blogLike.delete({
          where: { blogId_userId: { blogId, userId } },
        });
        await tx.blog.update({
          where: { id: blogId },
          data: { likeCount: { decrement: 1 } },
        });
      } else {
        await tx.blogLike.create({ data: { blogId, userId } });
        await tx.blog.update({
          where: { id: blogId },
          data: { likeCount: { increment: 1 } },
        });
      }
    });
    await this.#clearBlogCaches();
  }
}

export default new BlogService();
