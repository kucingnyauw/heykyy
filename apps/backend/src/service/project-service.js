import { getPrisma } from "../application/database.js";
import { validate } from "../validation/validation.js";
import {
  createProjectSchema,
  updateProjectSchema,
} from "../validation/project-validations.js";
import { ApiError, PaginationUtils, AssetUtils } from "@heykyy/utils-backend";
import { ProjectDto, ProjectListDto } from "../dtos/project-dtos.js";
import { supabase } from "../lib/supabase.js";
import { redis } from "../lib/redis.js";
import { convert } from "html-to-text";
import axios from "axios";
import slugify from "slugify";

/**
 * Service class for managing software project lifecycles.
 * Handles multimedia assets, automated audio generation, and hierarchical data management.
 */
class ProjectService {
  /**
   * Provides access to the Prisma ORM client.
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Clears project-related cache keys from Redis.
   * @private
   * @returns {Promise<void>}
   */
  async #clearProjectCaches() {
    try {
      const keys = await redis.keys("projects:list:*");
      if (keys.length > 0) await redis.del(...keys);
      await redis.del("projects:featured");
    } catch (err) {}
  }

  /**
   * Splits text into manageable chunks based on sentence boundaries for TTS processing.
   * @private
   * @param {string} text - Input text.
   * @param {number} [maxLength=1500] - Character limit per chunk.
   * @returns {string[]} Array of text segments.
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
   * Converts HTML content to audio and uploads it to storage.
   * @private
   * @param {string} htmlContent - Project description HTML.
   * @param {string} userId - ID of the project owner.
   * @param {string} fileName - Target file name.
   * @returns {Promise<{assetId: string|null}>} The generated asset ID or null.
   */
  async #generateAndUploadAudio(htmlContent, userId, fileName) {
    try {
      const cleanText = convert(htmlContent, {
        wordwrap: false,
        selectors: [
          {
            selector: "h1",
            format: "inline",
            options: { postfixed: " . . . . . ", uppercase: false },
          },
          {
            selector: "h2",
            format: "inline",
            options: { postfixed: " . . . . ", uppercase: false },
          },
          {
            selector: "h3",
            format: "inline",
            options: { postfixed: " . . . ", uppercase: false },
          },
          {
            selector: "h4",
            format: "inline",
            options: { postfixed: " . . . ", uppercase: false },
          },
          { selector: "li", format: "inline", options: { prefix: " . " } },
          { selector: "a", options: { ignoreHref: true } },
          { selector: "img", format: "skip" },
          { selector: "iframe", format: "skip" },
          { selector: "video", format: "skip" },
          { selector: "audio", format: "skip" },
          { selector: "code", format: "skip" },
          { selector: "pre", format: "skip" },
          { selector: "script", format: "skip" },
          { selector: "style", format: "skip" },
          { selector: "noscript", format: "skip" },
          { selector: "button", format: "skip" },
          { selector: "input", format: "skip" },
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
        fileName: `${fileName}-${Date.now()}.mp3`,
        mimeType: "audio/mpeg",
      };

      const uploadedAsset = await AssetUtils.createAsset(
        supabase,
        audioAssetRequest,
        "projects/audios"
      );

      const asset = await this.prisma.asset.create({
        data: {
          ...uploadedAsset,
          userId,
        },
      });

      return { assetId: asset.id };
    } catch (err) {
      return { assetId: null };
    }
  }

  /**
   * Selection object for detailed project data.
   * @private
   */
  get #projectDetailSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      summary: true,
      status: true,
      demoUrl: true,
      repositoryUrl: true,
      metaTitle: true,
      metaDesc: true,
      isFeatured: true,
      likeCount: true,
      viewCount: true,
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
      stacks: {
        select: {
          stack: { select: { id: true, name: true, icon: true, url: true } },
        },
      },
      thumbnails: {
        orderBy: { order: "asc" },
        select: {
          asset: { select: { id: true, url: true, storagePath: true } },
        },
      },
      audio: { select: { id: true, url: true, storagePath: true } },
      detail: { select: { contentHtml: true } },
    };
  }

  /**
   * Selection object for project listing data.
   * @private
   */
  get #projectListSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      summary: true,
      status: true,
      viewCount: true,
      likeCount: true,
      isFeatured: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { name: true } },
      category: { select: { name: true } },
      stacks: {
        select: {
          stack: { select: { name: true, icon: true } },
        },
      },
      thumbnails: {
        where: { order: 0 },
        take: 1,
        select: { asset: { select: { url: true } } },
      },
    };
  }

  /**
   * Batch uploads files to cloud storage.
   * @private
   * @param {Object[]} files - Array of file objects.
   * @returns {Promise<Object[]>} Upload results.
   * @throws {ApiError} If upload fails.
   */
  async #uploadAssets(files) {
    if (!files || files.length === 0) return [];
    const results = await Promise.all(
      files.map((file) =>
        AssetUtils.createAsset(supabase, file, "projects/thumbnails")
      )
    );
    if (results.some((r) => !r)) {
      throw new ApiError(
        500,
        "Failed to upload project thumbnails. Please check your connection and try again."
      );
    }
    return results;
  }

  /**
   * Creates a new project.
   * @param {string} userId - Creator ID.
   * @param {Object} request - Project data.
   * @param {Object[]} files - Thumbnail images.
   * @returns {Promise<ProjectDto>} The created project.
   * @throws {ApiError} If project cannot be created.
   */
  async create(userId, request, files) {
    let tempPaths = [];
    let createdAssetIds = [];

    try {
      const payload = validate(createProjectSchema, request);
      const uploadedData = files ? await this.#uploadAssets(files) : [];
      tempPaths = uploadedData.map((a) => a.storagePath);

      if (uploadedData.length) {
        await this.prisma.asset.createMany({
          data: uploadedData.map((a) => ({ ...a, userId })),
          skipDuplicates: true,
        });

        const createdAssets = await this.prisma.asset.findMany({
          where: { storagePath: { in: tempPaths } },
          select: { id: true },
        });
        createdAssetIds = createdAssets.map((a) => a.id);
      }

      const slug = slugify(payload.title, { lower: true, strict: true });

      let audioAssetId = null;

      if (payload.status === "PUBLISHED" && payload.contentHtml) {
        const audioResult = await this.#generateAndUploadAudio(
          payload.contentHtml,
          userId,
          slug
        );
        audioAssetId = audioResult.assetId;
      }

      const project = await this.prisma.project.create({
        data: {
          title: payload.title,
          slug,
          summary: payload.summary,
          status: payload.status,
          demoUrl: payload.demoUrl,
          metaTitle: payload.metaTitle,
          metaDesc: payload.metaDesc,
          isFeatured: payload.isFeatured,
          repositoryUrl: payload.repoUrl,
          audio: audioAssetId ? { connect: { id: audioAssetId } } : undefined,
          author: { connect: { id: userId } },
          category: payload.categoryId
            ? { connect: { id: payload.categoryId } }
            : undefined,
          detail: {
            create: {
              contentHtml: payload.contentHtml || "",
            },
          },
          stacks: {
            create: (payload.stackIds || []).map((id) => ({ stackId: id })),
          },
          thumbnails: {
            create: createdAssetIds.map((id, index) => ({
              assetId: id,
              order: index,
            })),
          },
        },
      });

      await this.#clearProjectCaches();
      return this.get(project.slug, userId);
    } catch (err) {
      for (const path of tempPaths)
        await AssetUtils.deleteAsset(supabase, path).catch(() => {});

      if (err instanceof ApiError) throw err;
      throw new ApiError(500, `Failed to create project: ${err.message}`);
    }
  }

  /**
   * Updates an existing project.
   * @param {string} id - Project ID.
   * @param {string} userId - User performing update.
   * @param {Object} request - Updated fields.
   * @param {Object[]} files - New thumbnail images.
   * @returns {Promise<ProjectDto>} The updated project.
   * @throws {ApiError} 404 if project not found.
   */
  async update(id, userId, request, files) {
    let tempPaths = [];
    const payload = validate(updateProjectSchema, request);

    const existing = await this.prisma.project.findUnique({
      where: { id },
      include: {
        detail: true,
        audio: true,
        thumbnails: { include: { asset: true } },
      },
    });

    if (!existing) {
      throw new ApiError(
        404,
        "The project you are trying to update could not be found."
      );
    }

    try {
      const updateData = {};
      const fields = [
        "title",
        "summary",
        "status",
        "demoUrl",
        "isFeatured",
        "metaTitle",
        "metaDesc",
        "repositoryUrl",
        "categoryId",
      ];

      fields.forEach((field) => {
        if (
          payload[field] !== undefined &&
          payload[field] !== existing[field]
        ) {
          updateData[field] = payload[field];
        }
      });

      delete updateData.categoryId;

      if (updateData.title) {
        updateData.slug = slugify(updateData.title, {
          lower: true,
          strict: true,
        });
      }

      const detailUpdate = {};
      if (payload.contentHtml !== undefined) {


        const cleanedHtml = (payload.contentHtml || "")
          .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, "")
          .trim();

          console.log("html cleaned" , JSON.stringify(cleanedHtml , null ,2));

        const normalize = (html) =>
          (html || "")
            .replace(/<p>\s*(<br\s*\/?>)?\s*<\/p>/gi, "")
            .replace(/\s+/g, " ")
            .trim();

        const normalizedNew = normalize(payload.contentHtml);
        const normalizedOld = normalize(existing.detail?.contentHtml);

        if (normalizedNew !== normalizedOld) {
          detailUpdate.contentHtml = cleanedHtml;

          if ((payload.status || existing.status) === "PUBLISHED") {
            const audioResult = await this.#generateAndUploadAudio(
              cleanedHtml,
              userId,
              updateData.slug || existing.slug
            );

            if (audioResult.assetId) {
              if (existing.audio) {
                await AssetUtils.deleteAsset(
                  supabase,
                  existing.audio.storagePath
                ).catch(() => {});
                await this.prisma.asset
                  .delete({ where: { id: existing.audio.id } })
                  .catch(() => {});
              }
              updateData.audio = { connect: { id: audioResult.assetId } };
            }
          }
        }
      }

      const uploadedData = files ? await this.#uploadAssets(files) : [];
      tempPaths = uploadedData.map((a) => a.storagePath);
      if (uploadedData.length) {
        await this.prisma.asset.createMany({
          data: uploadedData.map((a) => ({ ...a, userId })),
          skipDuplicates: true,
        });
      }
      const dbNewAssets = await this.prisma.asset.findMany({
        where: { storagePath: { in: tempPaths } },
      });

      const project = await this.prisma.project.update({
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

      if (payload.stackIds !== undefined) {
        await this.prisma.projectStack.deleteMany({ where: { projectId: id } });
        if (payload.stackIds.length) {
          await this.prisma.projectStack.createMany({
            data: payload.stackIds.map((sid) => ({
              projectId: id,
              stackId: sid,
            })),
          });
        }
      }

      if (files || payload.existingImageIds !== undefined) {
        const currentThumbIds = existing.thumbnails.map((t) => t.asset.id);
        const keptIds = (payload.existingImageIds || []).filter((eid) =>
          currentThumbIds.includes(eid)
        );
        const newThumbIds = dbNewAssets.map((a) => a.id);

        const toDelete = existing.thumbnails.filter(
          (t) => !keptIds.includes(t.asset.id)
        );
        for (const td of toDelete) {
          await AssetUtils.deleteAsset(supabase, td.asset.storagePath).catch(
            () => {}
          );
          await this.prisma.asset
            .delete({ where: { id: td.asset.id } })
            .catch(() => {});
        }

        await this.prisma.projectThumbnail.deleteMany({
          where: { projectId: id },
        });
        await this.prisma.projectThumbnail.createMany({
          data: [...keptIds, ...newThumbIds].map((assetId, index) => ({
            projectId: id,
            assetId,
            order: index,
          })),
        });
      }

      await this.#clearProjectCaches();
      return this.get(project.slug, userId);
    } catch (err) {
      for (const path of tempPaths)
        await AssetUtils.deleteAsset(supabase, path).catch(() => {});

      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        `Unexpected error during project update: ${err.message}`
      );
    }
  }

  /**
   * Retrieves a single project by slug.
   * @param {string} slug - Project slug.
   * @param {string} [userId] - Current user ID for access and like check.
   * @returns {Promise<ProjectDto>}
   * @throws {ApiError} 404 if not found, 403 if unauthorized.
   */
  async get(slug, userId) {
    const [project, user] = await Promise.all([
      this.prisma.project.findUnique({
        where: { slug },
        select: this.#projectDetailSelect,
      }),
      userId
        ? this.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
          })
        : null,
    ]);

    if (!project) {
      throw new ApiError(
        404,
        "The project you are looking for does not exist."
      );
    }
    const isAdmin = user?.role === "ADMIN";
    if (project.status !== "PUBLISHED" && !isAdmin) {
      throw new ApiError(
        403,
        "You do not have permission to view this project."
      );
    }

    if (!isAdmin) {
      this.prisma.project
        .update({
          where: { id: project.id },
          data: { viewCount: { increment: 1 } },
        })
        .catch(() => {});
    }

    const hasLiked = userId
      ? Boolean(
          await this.prisma.projectLike.findUnique({
            where: { projectId_userId: { projectId: project.id, userId } },
          })
        )
      : false;
    return new ProjectDto(project, hasLiked);
  }

  /**
   * Retrieves paginated projects list.
   * @param {string} userId - User context.
   * @param {number} page - Page index.
   * @param {number} limit - Items per page.
   * @param {string} [search] - Search keyword.
   * @param {string} [status] - Filter by status.
   * @param {string} [categoryId] - Filter by category ID.
   * @param {boolean} [isFeatured] - Filter by featured status.
   * @param {string} [stackId] - Filter by technology stack.
   * @param {string} [sortBy] - Sorting criteria (latest, popular, most_liked).
   * @returns {Promise<Object>} Data and metadata.
   */
  async gets(
    userId,
    page,
    limit,
    search,
    status,
    categoryId,
    isFeatured,
    stackId,
    sortBy = "latest"
  ) {
    const isAdmin = userId
      ? await this.prisma.user
          .findUnique({ where: { id: userId }, select: { role: true } })
          .then((u) => u?.role === "ADMIN")
      : false;

    const cacheKey = `projects:list:${
      isAdmin ? `admin:${userId}` : "public"
    }:${page}:${limit}:${search || ""}:${status || ""}:${categoryId || ""}:${
      isFeatured || ""
    }:${stackId || ""}:${sortBy}`;

    const cached = await redis.get(cacheKey);
    if (cached) return typeof cached === "string" ? JSON.parse(cached) : cached;

    const { skip, limit: take } = PaginationUtils.create({ page, limit });

    const where = {
      ...(isAdmin ? (status ? { status } : {}) : { status: "PUBLISHED" }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { summary: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(isFeatured !== undefined && {
        isFeatured: isFeatured === "true" || isFeatured === true,
      }),
      ...(stackId && { stacks: { some: { stackId } } }),
    };

    const orderMapping = {
      latest: { createdAt: "desc" },
      popular: { viewCount: "desc" },
      most_liked: { likeCount: "desc" },
    };

    const [total, projects] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: orderMapping[sortBy] || orderMapping.latest,
        select: this.#projectListSelect,
      }),
    ]);

    const result = {
      data: projects.map((p) => new ProjectListDto(p)),
      metadata: PaginationUtils.generateMetadata(total, page, take),
    };

    await redis.set(cacheKey, JSON.stringify(result), { ex: 86400 });
    return result;
  }

  /**
   * Fetches a random selection of published projects.
   * @param {string} slug - Slug to exclude.
   * @returns {Promise<ProjectListDto[]>}
   */
  async getsRandomProject(slug) {
    const take = 4;
    const where = { slug: { not: slug }, status: "PUBLISHED" };
    const total = await this.prisma.project.count({ where });
    if (total === 0) return [];

    const maxSkip = Math.max(total - take, 0);
    const skip = Math.floor(Math.random() * (maxSkip + 1));

    const projects = await this.prisma.project.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: this.#projectListSelect,
    });
    return projects.map((p) => new ProjectListDto(p));
  }

  /**
   * Deletes a project and its associated media assets.
   * @param {string} id - Project ID.
   * @returns {Promise<void>}
   * @throws {ApiError} 404 if project not found.
   */
  async delete(id) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { thumbnails: { include: { asset: true } }, audio: true },
    });

    if (!project) {
      throw new ApiError(404, "Could not delete project: project not found.");
    }

    const assetsToDelete = [
      ...project.thumbnails.map((t) => t.asset),
      project.audio,
    ].filter(Boolean);
    for (const asset of assetsToDelete) {
      await AssetUtils.deleteAsset(supabase, asset.storagePath).catch(() => {});
    }

    await this.prisma.project.delete({ where: { id } });
    await this.#clearProjectCaches();
  }

  /**
   * Retrieves featured projects with caching.
   * @returns {Promise<ProjectListDto[]>}
   */
  async getFeatures() {
    const projects = await this.prisma.project.findMany({
      take: 3,
      where: { status: "PUBLISHED", isFeatured: true },
      orderBy: { createdAt: "desc" },
      select: this.#projectListSelect,
    });

    const result = projects.map((p) => new ProjectListDto(p));

    return result;
  }

  /**
   * Toggles the like status of a project for a user.
   * @param {string} userId - User ID.
   * @param {string} projectId - Project ID.
   * @returns {Promise<void>}
   * @throws {ApiError} 404 if project not found.
   */
  async toggleLike(userId, projectId) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new ApiError(404, "Project not found. It may have been removed.");
    }

    const existingLike = await this.prisma.projectLike.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
    await this.prisma.$transaction(async (tx) => {
      if (existingLike) {
        await tx.projectLike.delete({
          where: { projectId_userId: { projectId, userId } },
        });
        await tx.project.update({
          where: { id: projectId },
          data: { likeCount: { decrement: 1 } },
        });
      } else {
        await tx.projectLike.create({ data: { projectId, userId } });
        await tx.project.update({
          where: { id: projectId },
          data: { likeCount: { increment: 1 } },
        });
      }
    });
    await this.#clearProjectCaches();
  }
}

export default new ProjectService();
