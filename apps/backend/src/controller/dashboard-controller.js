import { AsyncHandler } from "@heykyy/utils-backend";
import DashboardService from "../service/dashboard-service.js";

/**
 * Controller class for administrative dashboard analytics.
 * Orchestrates the retrieval of platform-wide statistics and performance metrics.
 */
class DashboardController {
  /**
   * Retrieves aggregated dashboard data based on a specific time period.
   * Includes metrics for user engagement, content growth, and system activities.
   * * @param {import("express").Request} req - Request containing 'period' query (daily/weekly/monthly).
   * @param {import("express").Response} res - Success response with the dashboard metrics payload.
   */
  gets = AsyncHandler.catch(async (req, res) => {
    const period = req.query.period || "daily";
    const dashboard = await DashboardService.gets(period);

    res.status(200).json({
      success: true,
      message: "Dashboard analytics retrieved successfully.",
      data: dashboard,
    });
  });
}

export default new DashboardController();