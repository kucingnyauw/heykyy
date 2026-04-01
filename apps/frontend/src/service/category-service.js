import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

export const getCategories = async (page = 1, limit = 10, type) => {
  try {
    const params = {
      page,
      limit,
      ...(type && { type }),
    };

    const res = await Client.get("/categories", { params });

    return ResponseHandler.handleSuccess(res.data, ({ data, metadata }) => ({
      data,
      metadata,
    }));
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};