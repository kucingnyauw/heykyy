import { ApiError } from "@heykyy/utils-backend";

export class AsyncHandler {
  static catch(fn) {
    return async (req, res, next) => {
      try {
        await fn(req, res, next);
      } catch (err) {
        const error = err instanceof ApiError
          ? err
          : new ApiError(500, err.message || "Internal Server Error");

        res.status(error.statusCode).json(error.toJSON());
      }
    };
  }
}
