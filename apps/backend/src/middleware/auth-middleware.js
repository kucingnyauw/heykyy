import { DEFAULT_CACHE_TTL } from "@heykyy/constant";

import { getPrisma } from "../application/database.js";
import { redis } from "../lib/redis.js";
import { supabase } from "../lib/supabase.js";
import { ApiError } from "../utils/index.js";

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  about: true,
  role: true,
  profilePhoto: { select: { url: true } },
  createdAt: true,
  updatedAt: true,
};

/**
 * Fetches user data from Supabase Auth service using the provided access token.
 * @param {string} token - The Bearer access token from the client.
 * @returns {Promise<Object|null>} Supabase user object or null if invalid.
 */
const getSupabaseUser = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch (err) {
    return null;
  }
};

/**
 * Retrieves user details from the database with a cache-aside strategy using Redis.
 * @param {string} email - The unique email address of the user.
 * @returns {Promise<Object|null>} Database user record or null if not found.
 */
const getCachedUser = async (email) => {
  const cacheKey = `user:profile:${email}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return typeof cachedData === "string"
        ? JSON.parse(cachedData)
        : cachedData;
    }

    const user = await getPrisma().user.findUnique({
      where: { email },
      select: USER_SELECT,
    });

    if (user) {
      await redis.set(cacheKey, JSON.stringify(user), {
        ex: DEFAULT_CACHE_TTL,
      });
    }

    return user;
  } catch (err) {
    return await getPrisma().user.findUnique({
      where: { email },
      select: USER_SELECT,
    });
  }
};

/**
 * Middleware to enforce authentication.
 * Rejects requests without a valid token or unregistered users.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!accessToken) {
      throw new ApiError(
        401,
        "Access denied. A valid authentication token is required to access this resource."
      );
    }

    const supabaseUser = await getSupabaseUser(accessToken);
    if (!supabaseUser?.email) {
      throw new ApiError(
        401,
        "Your session has expired or the provided token is invalid."
      );
    }

    const user = await getCachedUser(supabaseUser.email);

    if (!user) {
      throw new ApiError(
        401,
        "This account is not registered in our database. Please complete your profile setup."
      );
    }

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) {
      return res.status(err.statusCode).json(err.toJSON());
    }

    return res.status(500).json({
      success: false,
      message: "An internal error occurred during the authentication process.",
    });
  }
};

/**
 * Middleware for optional authentication.
 * Populates req.user if a valid token is provided, allowing the request to proceed as a guest otherwise.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @param {import('express').NextFunction} next - Express next middleware function.
 */
export const optionalAuthMiddleware = async (req, res, next) => {
  req.user = null;

  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!accessToken) return next();

    const supabaseUser = await getSupabaseUser(accessToken);
    if (!supabaseUser?.email) return next();

    const user = await getCachedUser(supabaseUser.email);

    if (user) {
      req.user = user;
    }

    next();
  } catch (err) {
    next();
  }
};
