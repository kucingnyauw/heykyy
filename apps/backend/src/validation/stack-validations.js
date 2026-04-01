import Joi from "joi";

/**
 * Validation schema for creating a new technology stack.
 * Enforces character limits for the name and validates URL formats for the icon and link.
 */
export const createStackSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.base": `"name" must be a valid text string.`,
      "string.empty": `"name" cannot be empty.`,
      "string.min": `"name" must be at least 2 characters long.`,
      "string.max": `"name" cannot exceed 50 characters.`,
      "any.required": `"name" is a required field.`
    }),
  
  icon: Joi.string()
    .uri()
    .optional()
    .allow(null, "")
    .messages({
      "string.uri": `"icon" must be a valid URL.`
    }),
  
  url: Joi.string()
    .uri()
    .optional()
    .allow(null, "")
    .messages({
      "string.uri": `"url" must be a valid URL.`
    })
});

/**
 * Validation schema for updating an existing technology stack.
 * Requires at least one field to be provided for the update process.
 */
export const updateStackSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional()
    .messages({
      "string.base": `"name" must be a valid text string.`,
      "string.empty": `"name" cannot be empty.`,
      "string.min": `"name" must be at least 2 characters long.`,
      "string.max": `"name" cannot exceed 50 characters.`
    }),
  
  icon: Joi.string()
    .uri()
    .optional()
    .allow(null, "")
    .messages({
      "string.uri": `"icon" must be a valid URL.`
    }),
  
  url: Joi.string()
    .uri()
    .optional()
    .allow(null, "")
    .messages({
      "string.uri": `"url" must be a valid URL.`
    })
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided to update the tech stack."
  });