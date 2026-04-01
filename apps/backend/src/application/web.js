import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import publicRoutes from "../routes/public-routes.js";
import privateRoutes from "../routes/private-routes.js";
import { errorMiddleware } from "../middleware/error-middleware.js";
import { ApiError } from "@heykyy/utils-backend";

import * as Sentry from "@sentry/node";

// ======================
// Sentry Initialization
// ======================
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
});

// ======================
// ES Module __dirname Fix
// ======================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================
// Express App Setup
// ======================
const web = express();
const isProduction = process.env.NODE_ENV === "production";

// Trust Proxy
web.set("trust proxy", 1);

// ======================
// View Engine Setup
// ======================
web.set("view engine", "ejs");
web.set("views", path.join(__dirname, "../views"));

// ======================
// Security & CORS Middleware
// ======================
web.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = process.env.ORIGIN
  ? process.env.ORIGIN.split(",").map((origin) => origin.trim())
  : "*";

web.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// ======================
// Body Parsing & Cookies
// ======================
web.use(express.json({ limit: "50mb" }));
web.use(express.urlencoded({ limit: "50mb", extended: true }));
web.use(cookieParser());

// ======================
// HTTP Logging
// ======================
web.use(morgan(isProduction ? "combined" : "dev"));

// ======================
// Static File Serving
// ======================
web.use(express.static(path.join(__dirname, "../public")));

// ======================
// Root Route
// ======================
web.get("/", (req, res) => {
  res.render("index", {
    title: "Heykyy API Services",
    version: process.env.API_VERSION || "v1",
    status: "Running flawlessly 🚀",
  });
});

// ======================
// Application Routes
// ======================
web.use(publicRoutes);
web.use(privateRoutes);

// ======================
// Global 404 Handler
// ======================
web.use((req, res, next) => {
  const error = new ApiError(
    404,
    `The requested endpoint [${req.method}] ${req.originalUrl} does not exist on this server.`,
    {
      title: "Endpoint Not Found",
      code: "NOT_FOUND",
      isOperational: true,
    }
  );
  next(error);
});



// ======================
// Sentry Error Handler
// ======================
// The error handler must be registered before any other error middleware
// and after all controllers
Sentry.setupExpressErrorHandler(web)

// ======================
// Global Error Handler
// ======================
web.use(errorMiddleware);

export { web };
