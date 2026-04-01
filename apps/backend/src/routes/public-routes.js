import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { optionalAuthMiddleware } from "../middleware/auth-middleware.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { timeoutMiddleware } from "../middleware/timeout-middleware.js";

/** Controller Imports */
import ProjectController from "../controller/project-controller.js";
import BlogController from "../controller/blog-controller.js";
import CertificateController from "../controller/certificate-controller.js";
import CategoryController from "../controller/category-controller.js";
import TechController from "../controller/tech-controller.js";
import CommentController from "../controller/comment-controller.js";
import CvController from "../controller/cv-controller.js";
import EducationController from "../controller/education-controller.js";
import AssistantController from "../controller/assistant-controller.js";
import HealthController from "../controller/health-controller.js";
import { STANDARD_TIMEOUT, AI_TIMEOUT } from "@heykyy/constant";

const router = Router();
const API_VERSION = process.env.API_VERSION || "v1";
const prefix = `/api/${API_VERSION}`;

/**
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests
 * @param {string} message - Error message when limit is exceeded
 * @returns {import("express-rate-limit").RateLimitRequestHandler}
 */
const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { status: 429, message },
  standardHeaders: true,
  legacyHeaders: false,
});

const standardLimit = createLimiter(15 * 60 * 1000, 500, "Too many requests, please try again later.");
const strictLimit = createLimiter(5 * 60 * 1000, 30, "Rate limit exceeded. Please wait a moment.");
const aiLimit = createLimiter(60 * 60 * 1000, 20, "AI usage limit reached. Please try again in an hour.");

/** Global Discovery Middleware */
router.use(prefix, timeoutMiddleware(STANDARD_TIMEOUT));

/**
 * System & Health Routes
 */
router.get(`${prefix}/health`, strictLimit, HealthController.check);
router.get(`${prefix}/health/detailed`, strictLimit, HealthController.detailed);

/**
 * Project Discovery Routes
 */
router.get(
  `${prefix}/projects`,
  standardLimit,
  optionalAuthMiddleware,
  ProjectController.gets
);
router.get(`${prefix}/projects/featured`, standardLimit, ProjectController.getFeatured);
router.get(
  `${prefix}/projects/recommendations/:slug`,
  standardLimit,
  ProjectController.getRecommendations
);
router.get(
  `${prefix}/projects/:slug`,
  standardLimit,
  optionalAuthMiddleware,
  ProjectController.get
);

/**
 * Blog & Content Routes
 */
router.get(`${prefix}/blogs`, standardLimit, optionalAuthMiddleware, BlogController.gets);
router.get(`${prefix}/blogs/featured`, standardLimit, BlogController.getFeatured);
router.get(
  `${prefix}/blogs/recommendations/:slug`,
  standardLimit,
  BlogController.getRecommendations
);
router.get(`${prefix}/blogs/:slug`, standardLimit, optionalAuthMiddleware, BlogController.get);

/**
 * Credentials & Education Routes
 */
router.get(`${prefix}/certificates`, standardLimit, CertificateController.gets);
router.get(`${prefix}/certificates/:id`, standardLimit, CertificateController.get);
router.get(`${prefix}/educations`, standardLimit, EducationController.gets);

/**
 * Career Documents Routes
 */
router.get(`${prefix}/cvs/main`, standardLimit, CvController.getMain);

/**
 * Taxonomy & Tech Stack Routes
 */
router.get(`${prefix}/stacks`, standardLimit, TechController.gets);
router.get(
  `${prefix}/categories`,
  standardLimit,
  optionalAuthMiddleware,
  CategoryController.gets
);

/**
 * Social Interaction Routes
 */
router.get(
  `${prefix}/comments`,
  standardLimit,
  optionalAuthMiddleware,
  CommentController.gets
);

/**
 * AI Intelligence Routes
 */
router.post(
  `${prefix}/ai/ask`,
  aiLimit,
  timeoutMiddleware(AI_TIMEOUT),
  AssistantController.ask
);



/** Error Handling Middleware */
router.use(errorMiddleware);




export default router;