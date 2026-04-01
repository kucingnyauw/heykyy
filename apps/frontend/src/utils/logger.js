// src/utils/logger.js

const LOG_LEVEL = import.meta.env.VITE_LOG_LEVEL || "info";

const LEVELS = ["debug", "info", "warn", "error"];
const COLORS = {
  debug: "color: #888",
  info: "color: #007acc",
  warn: "color: #e6a23c",
  error: "color: #f56c6c",
};

/**
 * Checks if a message should be logged given the current LOG_LEVEL
 * @param {string} level
 */
function shouldLog(level) {
  return LEVELS.indexOf(level) >= LEVELS.indexOf(LOG_LEVEL);
}

/**
 * Logs a message with module prefix and color
 * @param {"debug"|"info"|"warn"|"error"} level
 * @param {string} moduleName
 * @param  {...any} args
 */
function log(level, moduleName, ...args) {
  if (!shouldLog(level)) return;
  const prefix = `[${moduleName}]`;
  if (typeof console[level] === "function") {
    console[level](`%c${prefix}`, COLORS[level], ...args);
  } else {
    console.log(prefix, ...args);
  }
}

/**
 * Factory to create module-scoped logger
 * @param {string} moduleName
 */
export function createLogger(moduleName) {
  return {
    debug: (...args) => log("debug", moduleName, ...args),
    info: (...args) => log("info", moduleName, ...args),
    warn: (...args) => log("warn", moduleName, ...args),
    error: (...args) => log("error", moduleName, ...args),
  };
}