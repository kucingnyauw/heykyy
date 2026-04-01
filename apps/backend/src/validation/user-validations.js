import Joi from "joi";

/**
 * Validation schema for updating user profile information.
 * Ensures that at least one field is provided and enforces character length constraints.
 */
export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "The name must be a valid text string.",
    "string.empty": "The name cannot be empty.",
    "string.min": "The name must be at least 2 characters long.",
    "string.max": "The name cannot exceed 100 characters.",
  }),

  about: Joi.string().trim().max(300).allow(null, "").optional().messages({
    "string.base": "The about description must be a valid text string.",
    "string.max": "The about description cannot exceed 300 characters.",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field (name or about) must be provided to update the profile.",
  });