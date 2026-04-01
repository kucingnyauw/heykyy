import Joi from "joi";

/** * Defined category types aligned with the Prisma database schema.
 */
const categoryTypeEnum = ["BLOG", "PROJECT"];

/**
 * Validation schema for creating a new category.
 * Requires a distinct name and a specific classification type.
 */
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .required()
    .messages({
      "string.base": "The category name must be a valid text string.",
      "string.empty": "The category name cannot be empty.",
      "string.min": "The category name must be at least 1 character long.",
      "string.max": "The category name cannot exceed 255 characters.",
      "any.required": "The category name is required.",
    }),
    
  type: Joi.string()
    .valid(...categoryTypeEnum)
    .required()
    .messages({
      "string.base": "The category type must be a valid text string.",
      "any.only": `The category type must be one of the following: ${categoryTypeEnum.join(", ")}.`,
      "any.required": "The category type is required.",
    }),
});

/**
 * Validation schema for updating an existing category.
 * All fields are optional, but at least one must be provided to proceed.
 */
export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(1)
    .max(255)
    .messages({
      "string.base": "The category name must be a valid text string.",
      "string.empty": "The category name cannot be empty.",
      "string.min": "The category name must be at least 1 character long.",
      "string.max": "The category name cannot exceed 255 characters.",
    }),
    
  type: Joi.string()
    .valid(...categoryTypeEnum)
    .messages({
      "string.base": "The category type must be a valid text string.",
      "any.only": `The category type must be one of the following: ${categoryTypeEnum.join(", ")}.`,
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided to update the category.",
  });