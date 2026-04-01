import winston from "winston";
import "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

/**
 * Logger configuration to handle system tracking and error persistence.
 * Organized into 'track-err' directory with daily rotation to prevent large file sizes.
 */

const isProduction = process.env.NODE_ENV === "production";
const logDir = "track-err";

/**
 * Ensure the log directory exists.
 * Using recursive: true to safely handle directory creation.
 */
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Standardized log format incorporating timestamps and stack traces for errors.
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [];

/**
 * Console transport for development environments with colorized output for readability.
 */
if (!isProduction) {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

/**
 * File transports for production environments.
 * Implements rotation to keep logs organized and manageable.
 */
if (isProduction) {
  /** Error-specific logs for critical failure tracking */
  transports.push(
    new winston.transports.DailyRotateFile({
      level: "error",
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    })
  );

  /** Combined logs for general system activity monitoring */
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
    })
  );
}

/**
 * Core logger instance used throughout the application.
 */
export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: logFormat,
  transports,
  exitOnError: false,
});
