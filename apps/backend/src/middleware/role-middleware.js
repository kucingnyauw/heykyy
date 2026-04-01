import { ApiError } from "@heykyy/utils-backend";

/**
 * Middleware factory to restrict access based on user roles.
 * This middleware assumes that authMiddleware has already been executed
 * and populated req.user.
 * * @param {...string} allowedRoles - List of roles permitted to access the route.
 * @returns {import('express').RequestHandler}
 */
export const roleMiddleware = (...allowedRoles) => {
  return async (req, _, next) => {
    try {
      /** Verify if user data exists from previous authentication middleware */
      if (!req.user) {
        throw new ApiError(
          401,
          "Authentication required. Please log in to access this resource."
        );
      }

      /** * Validation: Check if the user's role is included in the permitted roles.
       * We use req.user directly for efficiency, assuming the role is updated
       * and stored in the request object/cache.
       */
      const hasRequiredRole = allowedRoles.includes(req.user.role);

      if (!hasRequiredRole) {
        throw new ApiError(
          403,
          "Access denied. You do not have the necessary permissions to perform this action."
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
