import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils";

/**
 * Mengambil daftar sertifikat dengan pagination.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=6]
 *
 * @returns {Promise<{data: any[], metadata: any}>}
 */
export async function getCertificates({ page = 1, limit = 6 } = {}) {
  try {
    const queryParams = {
      page,
      limit,
    };

    const response = await Client.get("/certificates", {
      params: queryParams,
    });

    return ResponseHandler.handleSuccess(response.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}