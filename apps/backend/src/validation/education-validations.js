import Joi from "joi";

/**
 * Validation schema for adding a new educational background entry.
 * Enforces character limits for text fields and logical constraints for dates.
 */
export const createEducationSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required()
    .messages({
      "string.base": "The title must be a valid text string.",
      "string.empty": "The title cannot be empty.",
      "string.min": "The title must be at least 2 characters long.",
      "string.max": "The title cannot exceed 255 characters.",
      "any.required": "An education title or degree is required.",
    }),

  institution: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .required()
    .messages({
      "string.base": "The institution name must be a valid text string.",
      "string.empty": "The institution name cannot be empty.",
      "string.min": "The institution name must be at least 2 characters long.",
      "string.max": "The institution name cannot exceed 255 characters.",
      "any.required": "An institution name is required.",
    }),

  description: Joi.string()
    .trim()
    .max(255)
    .allow(null, "")
    .messages({
      "string.base": "The description must be a valid text string.",
      "string.max": "The description cannot exceed 255 characters.",
    }),

  startYear: Joi.date()
    .iso()
    .required()
    .messages({
      "date.base": "The start year must be a valid date.",
      "date.format": "The start year must follow the ISO date format.",
      "any.required": "A start year is required.",
    }),

  endYear: Joi.date()
    .iso()
    .min(Joi.ref("startYear"))
    .allow(null)
    .messages({
      "date.base": "The end year must be a valid date.",
      "date.format": "The end year must follow the ISO date format.",
      "date.min": "The end year must be greater than or equal to the start year.",
    }),

  isCurrent: Joi.boolean()
    .default(false)
    .messages({
      "boolean.base": "The isCurrent flag must be a boolean value.",
    }),
})
.custom((value, helpers) => {
  /** Business Logic: If currently studying, the end year should not be provided */
  if (value.isCurrent && value.endYear) {
    return helpers.message({ custom: "The end year must be null or empty if you are currently studying there." });
  }
  return value;
});

/**
 * Validation schema for updating an existing educational background entry.
 * Requires at least one field to be provided and enforces the same logical constraints.
 */
export const updateEducationSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .messages({
      "string.base": "The title must be a valid text string.",
      "string.empty": "The title cannot be empty.",
      "string.min": "The title must be at least 2 characters long.",
      "string.max": "The title cannot exceed 255 characters.",
    }),

  institution: Joi.string()
    .trim()
    .min(2)
    .max(255)
    .messages({
      "string.base": "The institution name must be a valid text string.",
      "string.empty": "The institution name cannot be empty.",
      "string.min": "The institution name must be at least 2 characters long.",
      "string.max": "The institution name cannot exceed 255 characters.",
    }),

  description: Joi.string()
    .trim()
    .max(255)
    .allow(null, "")
    .messages({
      "string.base": "The description must be a valid text string.",
      "string.max": "The description cannot exceed 255 characters.",
    }),

  startYear: Joi.date()
    .iso()
    .messages({
      "date.base": "The start year must be a valid date.",
      "date.format": "The start year must follow the ISO date format.",
    }),

  endYear: Joi.date()
    .iso()
    .min(Joi.ref("startYear"))
    .allow(null)
    .messages({
      "date.base": "The end year must be a valid date.",
      "date.format": "The end year must follow the ISO date format.",
      "date.min": "The end year must be greater than or equal to the start year.",
    }),

  isCurrent: Joi.boolean()
    .messages({
      "boolean.base": "The isCurrent flag must be a boolean value.",
    }),
})
.min(1)
.messages({
  "object.min": "At least one field must be provided to update the education record.",
})
.custom((value, helpers) => {
  /** Ensure logical consistency during updates */
  if (value.isCurrent === true && value.endYear) {
    return helpers.message({ custom: "The end year must be null or empty if you are currently studying there." });
  }
  return value;
});