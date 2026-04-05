
/**
 * Utility class for wrapping asynchronous Express middleware and controllers.
 * Ensures that any errors occurring during execution are caught and passed to the centralized error middleware.
 */
export class AsyncHandler {
  /**
   * Wraps an asynchronous function to catch potential errors and delegate them to the next middleware.
   *
   * @param {Function} fn - The asynchronous middleware or controller function to wrap.
   * @returns {import('express').RequestHandler} An Express request handler that manages asynchronous errors.
   */
  static catch(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}