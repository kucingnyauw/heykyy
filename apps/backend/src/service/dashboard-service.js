import { DEFAULT_CACHE_TTL } from "@heykyy/constant";

import { getPrisma } from "../application/database.js";
import { DashboardDto } from "../dtos/dashboard-dtos.js";
import { redis } from "../lib/redis.js";
import { ApiError } from "../utils/index.js";

/**
 * Service class for high-level administrative analytics and system monitoring.
 * This service consolidates data from multiple domains including Users, Blogs, Projects, and Comments.
 * It calculates period-over-period growth metrics and is optimized with Redis caching.
 */
class DashboardService {
  /**
   * Provides access to the Prisma ORM client instance.
   *
   * @returns {import('@prisma/client').PrismaClient}
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Calculates the temporal boundaries for analytical trend queries based on the requested interval.
   * Identifies both the current period and the previous period for growth calculation.
   *
   * @param {('daily'|'weekly'|'monthly'|'yearly')} period - The grouping interval for trends.
   * @returns {{start: Date, end: Date, prevStart: Date}} Calculated ranges for database filtering.
   * @private
   */
  #getDateRange(period) {
    const now = new Date();
    const start = new Date(now);
    const prevStart = new Date(now);

    switch (period) {
      case "daily":
        start.setDate(now.getDate() - 1);
        prevStart.setDate(now.getDate() - 2);
        break;
      case "weekly":
        start.setDate(now.getDate() - 7);
        prevStart.setDate(now.getDate() - 14);
        break;
      case "monthly":
        start.setMonth(now.getMonth() - 1);
        prevStart.setMonth(now.getMonth() - 2);
        break;
      case "yearly":
        start.setFullYear(now.getFullYear() - 1);
        prevStart.setFullYear(now.getFullYear() - 2);
        break;
      default:
        start.setDate(now.getDate() - 7);
        prevStart.setDate(now.getDate() - 14);
    }

    return { start, end: now, prevStart };
  }

  /**
   * Aggregates multi-domain analytical data with a Cache-Aside strategy.
   * Retrieves absolute totals, period-over-period counts for growth, and trends.
   *
   * @param {('daily'|'weekly'|'monthly'|'yearly')} [period="daily"] - The selected analytical window.
   * @returns {Promise<DashboardDto>} Aggregated dashboard data formatted via DTO.
   * @throws {ApiError} 500 - If the database transaction or aggregation fails.
   */
  async gets(period = "daily") {
    const cacheKey = `dashboard:stats:${period}`;

    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        return typeof cachedData === "string"
          ? JSON.parse(cachedData)
          : cachedData;
      }

      const { start, end, prevStart } = this.#getDateRange(period);

      const [
        totalUsers,
        currentUsers,
        prevUsers,
        totalBlogs,
        currentBlogs,
        prevBlogs,
        totalProjects,
        currentProjects,
        prevProjects,
        totalComments,
        currentComments,
        prevComments,
        blogAgg,
        projectAgg,
        blogStatus,
        projectStatus,
        blogTrend,
        projectTrend,
        userTrend,
        commentTrend,
        topBlogs,
        topProjects,
      ] = await this.prisma.$transaction([
        this.prisma.user.count({ where: { role: "USER" } }),
        this.prisma.user.count({
          where: { role: "USER", createdAt: { gte: start, lte: end } },
        }),
        this.prisma.user.count({
          where: { role: "USER", createdAt: { gte: prevStart, lt: start } },
        }),

        this.prisma.blog.count(),
        this.prisma.blog.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        this.prisma.blog.count({
          where: { createdAt: { gte: prevStart, lt: start } },
        }),

        this.prisma.project.count(),
        this.prisma.project.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        this.prisma.project.count({
          where: { createdAt: { gte: prevStart, lt: start } },
        }),

        this.prisma.comment.count(),
        this.prisma.comment.count({
          where: { createdAt: { gte: start, lte: end } },
        }),
        this.prisma.comment.count({
          where: { createdAt: { gte: prevStart, lt: start } },
        }),

        this.prisma.blog.aggregate({
          _sum: { viewCount: true, likeCount: true },
        }),
        this.prisma.project.aggregate({
          _sum: { viewCount: true, likeCount: true },
        }),

        this.prisma.blog.groupBy({ by: ["status"], _count: true }),
        this.prisma.project.groupBy({ by: ["status"], _count: true }),

        this.prisma.blog.groupBy({
          by: ["createdAt"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),
        this.prisma.project.groupBy({
          by: ["createdAt"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),
        this.prisma.user.groupBy({
          by: ["createdAt"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),
        this.prisma.comment.groupBy({
          by: ["createdAt"],
          where: { createdAt: { gte: start, lte: end } },
          _count: true,
        }),

        this.prisma.blog.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { viewCount: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            viewCount: true,
            likeCount: true,
            createdAt: true,
          },
        }),
        this.prisma.project.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { viewCount: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            viewCount: true,
            likeCount: true,
            createdAt: true,
          },
        }),
      ]);

      const result = new DashboardDto({
        summary: {
          users: {
            total: totalUsers,
            current: currentUsers,
            previous: prevUsers,
          },
          blogs: {
            total: totalBlogs,
            current: currentBlogs,
            previous: prevBlogs,
          },
          projects: {
            total: totalProjects,
            current: currentProjects,
            previous: prevProjects,
          },
          comments: {
            total: totalComments,
            current: currentComments,
            previous: prevComments,
          },
          views:
            (blogAgg._sum.viewCount || 0) + (projectAgg._sum.viewCount || 0),
          likes:
            (blogAgg._sum.likeCount || 0) + (projectAgg._sum.likeCount || 0),
        },
        status: {
          blogs: blogStatus,
          projects: projectStatus,
        },
        trends: {
          blogs: blogTrend,
          projects: projectTrend,
          users: userTrend,
          comments: commentTrend,
        },
        top: {
          blogs: topBlogs,
          projects: topProjects,
        },
      });

      await redis.set(cacheKey, JSON.stringify(result), { ex: DEFAULT_CACHE_TTL });

      return result;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError(
        500,
        "Analytics Failure: An internal server error occurred while aggregating dashboard metrics."
      );
    }
  }
}

export default new DashboardService();