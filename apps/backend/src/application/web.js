import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import * as Sentry from "@sentry/node";

import { errorMiddleware } from "../middleware/error-middleware.js";
import privateRoutes from "../routes/private-routes.js";
import publicRoutes from "../routes/public-routes.js";
import { ApiError } from "../utils/index.js";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  sendDefaultPii: true,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const web = express();
const isProduction = process.env.NODE_ENV === "production";

web.set("trust proxy", 1);

web.set("view engine", "ejs");
web.set("views", path.join(__dirname, "../views"));

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

web.use(express.json({ limit: "50mb" }));
web.use(express.urlencoded({ limit: "50mb", extended: true }));
web.use(cookieParser());

web.use(morgan(isProduction ? "combined" : "dev"));

web.use(express.static(path.join(__dirname, "../public")));

web.get("/", (req, res) => {
  res.render("index", {
    title: "Heykyy API Services",
    version: process.env.API_VERSION || "v1",
    status: "Running flawlessly 🚀",
  });
});

web.use(publicRoutes);
web.use(privateRoutes);

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

Sentry.setupExpressErrorHandler(web);

web.use(errorMiddleware);

export { web };
