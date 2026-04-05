import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils";

/**
 * Mengambil daftar riwayat pendidikan dengan pagination.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=100]
 *
 * @returns {Promise<any[]>}
 */
export async function getEducations({ page = 1, limit = 100 } = {}) {
  try {
    const queryParams = {
      page,
      limit,
    };

    const response = await Client.get("/educations", {
      params: queryParams,
    });

    return ResponseHandler.handleSuccess(response.data, (res) => res.data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}