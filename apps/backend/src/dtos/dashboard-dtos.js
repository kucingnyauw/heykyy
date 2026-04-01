/**
 * @typedef {Object} StatusMetrics
 * @property {string} status - The current state (e.g., DRAFT, PUBLISHED).
 * @property {number} count - Total items in this state.
 */

/**
 * @typedef {Object} TrendMetrics
 * @property {Date|string} date - The temporal point for the metric.
 * @property {number} count - The frequency recorded at this point.
 */

/**
 * @typedef {Object} PerformanceMetrics
 * @property {string} id - Content unique identifier.
 * @property {string} title - Content title.
 * @property {string} slug - Content slug for linking.
 * @property {number} viewCount - Total views accumulated.
 * @property {number} likeCount - Total likes accumulated.
 * @property {Date} createdAt - Initial creation timestamp.
 */

/**
 * DTO for aggregating system-wide analytics.
 * Consolidates data for overview cards, trend visualizations, 
 * and high-performance content leaderboards with growth calculations.
 */
class DashboardDto {
  /**
   * Initializes the dashboard data transfer object with calculated metrics.
   *
   * @param {Object} data - Raw aggregated data from service queries.
   */
  constructor(data) {
    this.summary = {
      users: this.#formatSummary(data.summary?.users),
      blogs: this.#formatSummary(data.summary?.blogs),
      projects: this.#formatSummary(data.summary?.projects),
      comments: this.#formatSummary(data.summary?.comments),
      views: this.#formatSummary(data.summary?.views),
      likes: this.#formatSummary(data.summary?.likes),
    };

    this.status = {
      blogs: (data.status?.blogs || []).map((s) => ({
        status: s.status,
        count: s._count ?? 0,
      })),
      projects: (data.status?.projects || []).map((s) => ({
        status: s.status,
        count: s._count ?? 0,
      })),
    };

    this.trends = {
      blogs: (data.trends?.blogs || []).map((t) => ({ date: t.createdAt, count: t._count ?? 0 })),
      projects: (data.trends?.projects || []).map((t) => ({ date: t.createdAt, count: t._count ?? 0 })),
      users: (data.trends?.users || []).map((t) => ({ date: t.createdAt, count: t._count ?? 0 })),
      comments: (data.trends?.comments || []).map((t) => ({ date: t.createdAt, count: t._count ?? 0 })),
    };

    this.top = {
      blogs: (data.top?.blogs || []).map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        viewCount: b.viewCount ?? 0,
        likeCount: b.likeCount ?? 0,
        createdAt: b.createdAt,
      })),
      projects: (data.top?.projects || []).map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        viewCount: p.viewCount ?? 0,
        likeCount: p.likeCount ?? 0,
        createdAt: p.createdAt,
      })),
    };
  }

  /**
   * Transforms raw metric data into a structured object with calculated growth.
   *
   * @param {Object|number} metric - Object containing total, current, and previous counts, or a flat number.
   * @returns {{ total: number, growth: number, trend: "up"|"down"|"neutral" }}
   * @private
   */
  #formatSummary(metric) {
    if (metric === undefined || metric === null) {
      return { total: 0, growth: 0, trend: "neutral" };
    }

    if (typeof metric === "number") {
      return { total: metric, growth: 0, trend: "neutral" };
    }

    const { total = 0, current = 0, previous = 0 } = metric;
    
    let growth = 0;
    if (previous === 0) {
      growth = current > 0 ? 100 : 0;
    } else {
      growth = ((current - previous) / previous) * 100;
    }

    return {
      total,
      growth: Number(growth.toFixed(1)),
      trend: growth > 0 ? "up" : growth < 0 ? "down" : "neutral",
    };
  }
}

export { DashboardDto };