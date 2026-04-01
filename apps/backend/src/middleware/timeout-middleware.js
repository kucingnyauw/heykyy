import { ApiError } from "@heykyy/utils-backend";

/**
 * Middleware factory to enforce a maximum duration for request processing.
 * Prevents long-running requests from consuming server resources indefinitely.
 * * @param {number} [seconds=30] - Maximum allowed time in seconds.
 * @returns {import('express').RequestHandler}
 */
export const timeoutMiddleware = (seconds = 30) => {
  return (req, res, next) => {
    const timeoutDuration = seconds * 1000;

    /** * Establish a timer to trigger a timeout error if the response
     * is not sent within the designated timeframe.
     */
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        const error = new ApiError(
          504,
          "The server took too long to respond. This request has been terminated for safety.",
          {
            title: "Request Timeout",
            code: "GATEWAY_TIMEOUT",
            isOperational: true,
          }
        );
        next(error);
      }
    }, timeoutDuration);

    /**
     * Ensure the timer is cleared if the response is successfully finished
     * or the connection is closed prematurely by the client.
     */
    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));

    next();
  };
};
