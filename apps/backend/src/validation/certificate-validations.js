import Joi from "joi";

/**
 * Validation schema for creating a new professional certificate entry.
 * Enforces text limits and ensures the year is valid and not in the future.
 */
export const createCertificateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255).required().messages({
    "string.base": "The certificate title must be a valid text string.",
    "string.empty": "The certificate title cannot be empty.",
    "string.min": "The certificate title must be at least 2 characters long.",
    "string.max": "The certificate title cannot exceed 255 characters.",
    "any.required": "The certificate title is required."
  }),

  summary: Joi.string().trim().min(5).max(500).required().messages({
    "string.base": "The certificate summary must be a valid text string.",
    "string.empty": "The certificate summary cannot be empty.",
    "string.min": "The certificate summary must be at least 5 characters long.",
    "string.max": "The certificate summary cannot exceed 500 characters.",
    "any.required": "The certificate summary is required."
  }),

  issuer: Joi.string().trim().min(2).max(255).required().messages({
    "string.base": "The issuer must be a valid text string.",
    "string.empty": "The issuer cannot be empty.",
    "string.min": "The issuer must be at least 2 characters long.",
    "string.max": "The issuer cannot exceed 255 characters.",
    "any.required": "The issuer is required."
  }),

  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required().messages({
    "number.base": "The year must be a valid number.",
    "number.integer": "The year must be a whole number.",
    "number.min": "The year cannot be earlier than 1900.",
    "number.max": `The year cannot exceed the current year (${new Date().getFullYear()}).`,
    "any.required": "The year is required."
  }),
});

/**
 * Validation schema for updating an existing certificate entry.
 * All fields are optional, but at least one field must be provided to process the update.
 */
export const updateCertificateSchema = Joi.object({
  title: Joi.string().trim().min(2).max(255).messages({
    "string.base": "The certificate title must be a valid text string.",
    "string.empty": "The certificate title cannot be empty.",
    "string.min": "The certificate title must be at least 2 characters long.",
    "string.max": "The certificate title cannot exceed 255 characters.",
  }),

  summary: Joi.string().trim().min(5).max(500).messages({
    "string.base": "The certificate summary must be a valid text string.",
    "string.empty": "The certificate summary cannot be empty.",
    "string.min": "The certificate summary must be at least 5 characters long.",
    "string.max": "The certificate summary cannot exceed 500 characters.",
  }),

  issuer: Joi.string().trim().min(2).max(255).messages({
    "string.base": "The issuer must be a valid text string.",
    "string.empty": "The issuer cannot be empty.",
    "string.min": "The issuer must be at least 2 characters long.",
    "string.max": "The issuer cannot exceed 255 characters.",
  }),

  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).messages({
    "number.base": "The year must be a valid number.",
    "number.integer": "The year must be a whole number.",
    "number.min": "The year cannot be earlier than 1900.",
    "number.max": `The year cannot exceed the current year (${new Date().getFullYear()}).`,
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided to update the certificate."
  });