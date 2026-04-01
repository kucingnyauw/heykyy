import Joi from "joi";

/**
 * Validation schema for uploading and creating a new CV (Curriculum Vitae).
 * Requires a descriptive title and allows designating it as the primary document.
 */
export const createCVSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required().messages({
    "string.base": "The title must be a valid text string.",
    "string.empty": "The title cannot be empty.",
    "string.min": "The title must be at least 2 characters long.",
    "string.max": "The title cannot exceed 100 characters.",
    "any.required": "A title is strictly required for the CV.",
  }),

  isMain: Joi.boolean().truthy("true").falsy("false").messages({
    "boolean.base": "The isMain flag must be a boolean value (true or false).",
  }),
});

/**
 * Validation schema for updating an existing CV.
 * All fields are optional, but at least one field must be provided to perform an update.
 */
export const updateCVSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).optional().messages({
    "string.base": "The title must be a valid text string.",
    "string.empty": "The title cannot be empty.",
    "string.min": "The title must be at least 2 characters long.",
    "string.max": "The title cannot exceed 100 characters.",
  }),

  isMain: Joi.boolean().truthy("true").falsy("false").messages({
    "boolean.base": "The isMain flag must be a boolean value (true or false).",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided to update the CV record.",
  });