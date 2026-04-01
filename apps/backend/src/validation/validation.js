import { ApiError } from "@heykyy/utils-backend";

/**
 * Validates a request payload against a specified Joi schema.
 * * Executes validation with strict configurations by default (collecting all errors
 * and disallowing unknown fields). If the validation fails, it constructs
 * and throws a standardized ApiError for the global error handler to catch.
 *
 * @param {import('joi').ObjectSchema} schema - The Joi schema to validate against.
 * @param {Object} request - The payload to validate (e.g., req.body, req.query).
 * @param {Object} [options={}] - Optional Joi configurations to override defaults.
 * @returns {Object} The validated and sanitized value.
 * @throws {ApiError} 400 Bad Request if validation constraints are not met.
 */
export const validate = (schema, request, options = {}) => {
  const { error, value } = schema.validate(request, {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: true /** Automatically remove fields not defined in the schema */,
    ...options,
  });

  if (error) {
    /** * Map Joi error details into a single readable string
     * and remove the default escaped quotes from field names for a cleaner response.
     */
    const errorMessage = error.details
      .map((detail) => detail.message.replace(/"/g, ""))
      .join(", ");

    throw new ApiError(400, `Validation failed: ${errorMessage}`);
  }

  return value;
};
