import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Retrieves aggregated statistical data for the administrative dashboard.
 * The statistics are dynamically filtered based on the specified time period.
 * * @param {string} period - The time frame to filter the dashboard metrics (e.g., 'daily', 'weekly', 'monthly', 'yearly').
 * @returns {Promise<Object>} A promise that resolves to the aggregated dashboard statistics data.
 * @throws {string|Error} Throws a formatted error string if the API request fails, or an Error object if the period parameter is missing.
 */
export const getsDashboard = async (period) => {
  if (!period) {
    throw new Error("Period is required to fetch dashboard data.");
  }

  try {
    const res = await Client.get("/dashboard/stats", {
      params: { period },
    });

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};