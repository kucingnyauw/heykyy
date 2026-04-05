/**
 * Custom Error class for handling API-specific exceptions.
 * Extends the native Error class to include HTTP status codes and structured metadata.
 */
export class ApiError extends Error {
    /**
     * @param {number} [statusCode=500] - HTTP status code for the error.
     * @param {string} [message="Internal Server Error"] - Descriptive error message.
     * @param {Object} [metadata={}] - Additional error details (title, code, etc.).
     */
    constructor(
      statusCode = 500,
      message = "An unexpected error occurred on the server.",
      metadata = {}
    ) {
      super(message);
  
      this.name = "ApiError";
      this.statusCode = statusCode;
  
      /** Assigning additional metadata for standardized responses */
      this.title = metadata.title || "Internal Server Error";
      this.code = metadata.code || "SERVER_ERROR";
      this.isOperational =
        metadata.isOperational !== undefined ? metadata.isOperational : true;
  
      /** Capturing stack trace to assist with internal debugging */
      Error.captureStackTrace(this, this.constructor);
    }
  
    /**
     * Serializes the error object into a standardized JSON format.
     * @returns {Object} Structured error response object.
     */
    toJSON() {
      return {
        success: false,
        message: this.message,
        error: {
          title: this.title,
          code: this.code || this.statusCode,
        },
      };
    }
  }
  