import { Router } from "express";
import { rateLimit } from "express-rate-limit";

import AssetController from "../controller/asset-controller.js";
import AssistantController from "../controller/assistant-controller.js";
import BlogController from "../controller/blog-controller.js";
import CategoryController from "../controller/category-controller.js";
import CertificateController from "../controller/certificate-controller.js";
import CommentController from "../controller/comment-controller.js";
import CvController from "../controller/cv-controller.js";
import DashboardController from "../controller/dashboard-controller.js";
import EducationController from "../controller/education-controller.js";
import ProjectController from "../controller/project-controller.js";
import TechController from "../controller/tech-controller.js";
import UserController from "../controller/user-controller.js";
import { authMiddleware } from "../middleware/auth-middleware.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { uploadMultiType } from "../middleware/file-middleware.js";
import { roleMiddleware } from "../middleware/role-middleware.js";
import { timeoutMiddleware } from "../middleware/timeout-middleware.js";

const router = Router();
const API_VERSION = process.env.API_VERSION || "v1";
const prefix = `/api/${API_VERSION}`;

/**
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Maximum number of requests
 * @param {string} message - Error message when limit is exceeded
 * @returns {import("express-rate-limit").RateLimitRequestHandler}
 */
const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { status: 429, message },
    standardHeaders: true,
    legacyHeaders: false,
  });

const standardLimit = createLimiter(
  15 * 60 * 1000,
  500,
  "Too many requests, please try again later."
);
const strictLimit = createLimiter(
  5 * 60 * 1000,
  50,
  "Rate limit exceeded. Please wait a moment."
);
const heavyLimit = createLimiter(
  15 * 60 * 1000,
  20,
  "Upload limit reached, please try again later."
);
const aiLimit = createLimiter(
  60 * 60 * 1000,
  20,
  "AI usage limit reached. Please try again in an hour."
);

/** Global Middleware */
router.use(prefix, timeoutMiddleware(30000), authMiddleware);

/** Account & Identity */
router.get(`${prefix}/auth/me`, standardLimit, UserController.me);
router.get(`${prefix}/users/activity`, standardLimit, UserController.activity);
router.post(
  `${prefix}/users/profile`,
  strictLimit,
  timeoutMiddleware(60000),
  uploadMultiType(["image"], "file"),
  UserController.update
);

/** Statistics & Analytics */
router.get(
  `${prefix}/dashboard/stats`,
  standardLimit,
  roleMiddleware("ADMIN"),
  DashboardController.gets
);

/** Project Management */
router
  .route(`${prefix}/projects`)
  .post(
    roleMiddleware("ADMIN"),
    heavyLimit,
    uploadMultiType(["image"], "files"),
    ProjectController.create
  );

router
  .route(`${prefix}/projects/:id`)
  .put(
    roleMiddleware("ADMIN"),
    heavyLimit,
    uploadMultiType(["image"], "files"),
    ProjectController.update
  )
  .delete(roleMiddleware("ADMIN"), strictLimit, ProjectController.delete);

router.post(
  `${prefix}/projects/:id/toggle-like`,
  strictLimit,
  ProjectController.toggleLike
);

/** Blog Management */
router
  .route(`${prefix}/blogs`)
  .post(
    roleMiddleware("ADMIN"),
    heavyLimit,
    timeoutMiddleware(60000),
    uploadMultiType(["image"], "file"),
    BlogController.create
  );

router
  .route(`${prefix}/blogs/:id`)
  .put(
    roleMiddleware("ADMIN"),
    heavyLimit,
    timeoutMiddleware(60000),
    uploadMultiType(["image"], "file"),
    BlogController.update
  )
  .delete(roleMiddleware("ADMIN"), strictLimit, BlogController.delete);

router.post(
  `${prefix}/blogs/:id/toggle-like`,
  strictLimit,
  BlogController.toggleLike
);

/** Professional Credentials (Certificates) */
router
  .route(`${prefix}/certificates`)
  .post(
    roleMiddleware("ADMIN"),
    heavyLimit,
    timeoutMiddleware(60000),
    uploadMultiType(["image", "docs"], "files"),
    CertificateController.create
  );

router
  .route(`${prefix}/certificates/:id`)
  .put(
    roleMiddleware("ADMIN"),
    heavyLimit,
    timeoutMiddleware(60000),
    uploadMultiType(["image", "docs"], "files"),
    CertificateController.update
  )
  .delete(roleMiddleware("ADMIN"), strictLimit, CertificateController.delete);

/** Career Documents (CV) */
router
  .route(`${prefix}/cvs`)
  .get(roleMiddleware("ADMIN"), standardLimit, CvController.gets)
  .post(
    roleMiddleware("ADMIN"),
    heavyLimit,
    timeoutMiddleware(60000),
    uploadMultiType(["docs"], "file"),
    CvController.create
  );

router
  .route(`${prefix}/cvs/:id`)
  .put(
    roleMiddleware("ADMIN"),
    heavyLimit,
    timeoutMiddleware(60000),
    uploadMultiType(["docs"], "file"),
    CvController.update
  )
  .delete(roleMiddleware("ADMIN"), strictLimit, CvController.delete);

/** Educational Background & Taxonomy */
router
  .route(`${prefix}/educations`)
  .post(roleMiddleware("ADMIN"), strictLimit, EducationController.create);

router
  .route(`${prefix}/educations/:id`)
  .put(roleMiddleware("ADMIN"), strictLimit, EducationController.update)
  .delete(roleMiddleware("ADMIN"), strictLimit, EducationController.delete);

router
  .route(`${prefix}/stacks`)
  .post(roleMiddleware("ADMIN"), strictLimit, TechController.create);

router
  .route(`${prefix}/stacks/:id`)
  .put(roleMiddleware("ADMIN"), strictLimit, TechController.update)
  .delete(roleMiddleware("ADMIN"), strictLimit, TechController.delete);

router
  .route(`${prefix}/categories`)
  .post(roleMiddleware("ADMIN"), strictLimit, CategoryController.create);

router
  .route(`${prefix}/categories/:id`)
  .put(roleMiddleware("ADMIN"), strictLimit, CategoryController.update)
  .delete(roleMiddleware("ADMIN"), strictLimit, CategoryController.delete);

/** Social Interaction (Comments) */
router.get(
  `${prefix}/comments/monitor`,
  standardLimit,
  roleMiddleware("ADMIN"),
  CommentController.getsMonitor
);

router
  .route(`${prefix}/comments/:id`)
  .post(strictLimit, CommentController.create)
  .put(strictLimit, CommentController.update)
  .delete(strictLimit, CommentController.delete);

/** AI Intelligence (Assistant) */
router.post(
  `${prefix}/ai/generate-blog`,
  roleMiddleware("ADMIN"),
  aiLimit,
  timeoutMiddleware(180000),
  AssistantController.generateBlogContent
);
router.post(
  `${prefix}/ai/generate-project`,
  roleMiddleware("ADMIN"),
  aiLimit,
  timeoutMiddleware(180000),
  AssistantController.generateProjectContent
);

/** System Assets */
router.post(
  `${prefix}/upload/assets`,
  roleMiddleware("ADMIN"),
  heavyLimit,
  timeoutMiddleware(60000),
  uploadMultiType(["image", "docs"], "file"),
  AssetController.create
);

router.use(errorMiddleware);

export default router;