import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils";

/**
 * Mengambil daftar kategori dengan pagination dan filter tipe.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @param {string} [params.type]
 *
 * @returns {Promise<{data: any[], metadata: any}>}
 */
export async function getCategories({ page = 1, limit = 10, type } = {}) {
  try {
    const queryParams = {
      page,
      limit,
      ...(type && { type }),
    };

    const response = await Client.get("/categories", {
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