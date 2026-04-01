import { ApiError } from "@heykyy/utils-backend";
import { logger } from "../application/logger.js";

/**
 * Global Error Handling Middleware.
 * Standardizes all error responses and prevents sensitive system information leaks in production.
 * Also includes optional Sentry error ID if available.
 *
 * @param {Error} err - Error object caught by Express.
 * @param {import('express').Request} req - Express Request object.
 * @param {import('express').Response & { sentry?: string }} res - Express Response object, optionally augmented by Sentry.
 * @param {import('express').NextFunction} next - Express Next function.
 * @returns {void}
 */
export const errorMiddleware = (err, req, res, next) => {
  let error = err;

  // Wrap non-operational errors into a standardized ApiError
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message =
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "An unexpected error occurred. Please contact support if the problem persists."
        : error.message || "A server-side error occurred.";

    error = new ApiError(statusCode, message, {
      title: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
      isOperational: false,
    });
  }

  // Log full error details for debugging and audit
  logger.error({
    message: err.message,
    statusCode: error.statusCode,
    code: error.code || "SERVER_ERROR",
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });

  // Build response payload
  const responsePayload = {
    success: false,
    message: error.message,
    error: {
      title: error.title,
      code: error.code,
      // Only expose stack trace in non-production environments
      ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    },
  };

  // Include Sentry error ID if available
  if (res.sentry) {
    responsePayload.sentryId = res.sentry;
  }

  // Send JSON response
  res.status(error.statusCode).json(responsePayload);
};