import Joi from "joi";

/**
 * Allowed status values for a blog post.
 */
const statusEnum = ["DRAFT", "PUBLISHED", "ARCHIVED"];

/**
 * Validation schema for creating a new blog post.
 * Enforces strict length limits, valid status enums, and structured tags.
 */
export const createBlogSchema = Joi.object({
  status: Joi.string()
    .valid(...statusEnum)
    .default("DRAFT")
    .messages({
      "any.only": `The status must be one of the following: ${statusEnum.join(", ")}.`,
    }),

  title: Joi.string().trim().min(3).max(150).required().messages({
    "string.base": "The title must be a valid text string.",
    "string.empty": "The title cannot be empty.",
    "string.min": "The title must be at least 3 characters long.",
    "string.max": "The title cannot exceed 150 characters.",
    "any.required": "A blog title is strictly required.",
  }),

  summary: Joi.string()
    .trim()
    .allow(null, "")
    .min(10)
    .max(300)
    .messages({
      "string.min": "The summary must be at least 10 characters long.",
      "string.max": "The summary cannot exceed 300 characters.",
    }),

  contentHtml: Joi.string()
    .trim()
    .allow(null, "")
    .min(20)
    .max(50000)
    .messages({
      "string.min": "The HTML content must be at least 20 characters long.",
      "string.max": "The HTML content cannot exceed 50,000 characters.",
    }),

  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().min(2).max(30)).max(10),
      Joi.string().trim().min(2).max(30)
    )
    .custom((v) => (typeof v === "string" ? [v] : v))
    .messages({
      "string.min": "Each tag must be at least 2 characters long.",
      "string.max": "Each tag cannot exceed 30 characters.",
      "array.max": "You cannot add more than 10 tags.",
    }),

  metaTitle: Joi.string().trim().allow(null, "").min(10).max(60).messages({
    "string.min": "The meta title must be at least 10 characters long.",
    "string.max": "The meta title cannot exceed 60 characters.",
  }),

  metaDesc: Joi.string().trim().allow(null, "").min(20).max(160).messages({
    "string.min": "The meta description must be at least 20 characters long.",
    "string.max": "The meta description cannot exceed 160 characters.",
  }),

  isFeatured: Joi.boolean().truthy("true").falsy("false").messages({
    "boolean.base": "The isFeatured flag must be a boolean value.",
  }),

  categoryId: Joi.string().uuid().allow(null, "").messages({
    "string.guid": "The Category ID must be a valid UUID format.",
  }),
}).prefs({
  convert: true,
  stripUnknown: true,
  abortEarly: false,
});

/**
 * Validation schema for updating an existing blog post.
 * All fields are optional, but at least one field must be provided to process the update.
 */
export const updateBlogSchema = Joi.object({
  status: Joi.string()
    .valid(...statusEnum)
    .messages({
      "any.only": `The status must be one of the following: ${statusEnum.join(", ")}.`,
    }),

  title: Joi.string().trim().min(3).max(150).messages({
    "string.base": "The title must be a valid text string.",
    "string.empty": "The title cannot be empty.",
    "string.min": "The title must be at least 3 characters long.",
    "string.max": "The title cannot exceed 150 characters.",
  }),

  summary: Joi.string().trim().allow(null, "").min(10).max(300).messages({
    "string.min": "The summary must be at least 10 characters long.",
    "string.max": "The summary cannot exceed 300 characters.",
  }),

  contentHtml: Joi.string()
    .trim()
    .allow(null, "")
    .min(20)
    .max(50000)
    .messages({
      "string.min": "The HTML content must be at least 20 characters long.",
      "string.max": "The HTML content cannot exceed 50,000 characters.",
    }),

  tags: Joi.alternatives()
    .try(
      Joi.array().items(Joi.string().trim().min(2).max(30)).max(10),
      Joi.string().trim().min(2).max(30)
    )
    .custom((v) => (typeof v === "string" ? [v] : v))
    .messages({
      "string.min": "Each tag must be at least 2 characters long.",
      "string.max": "Each tag cannot exceed 30 characters.",
      "array.max": "You cannot add more than 10 tags.",
    }),

  metaTitle: Joi.string().trim().allow(null, "").min(10).max(60).messages({
    "string.min": "The meta title must be at least 10 characters long.",
    "string.max": "The meta title cannot exceed 60 characters.",
  }),

  metaDesc: Joi.string().trim().allow(null, "").min(20).max(160).messages({
    "string.min": "The meta description must be at least 20 characters long.",
    "string.max": "The meta description cannot exceed 160 characters.",
  }),

  isFeatured: Joi.boolean().truthy("true").falsy("false").messages({
    "boolean.base": "The isFeatured flag must be a boolean value.",
  }),

  categoryId: Joi.string().uuid().allow(null, "").messages({
    "string.guid": "The Category ID must be a valid UUID format.",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided to perform an update on the blog post.",
  })
  .prefs({
    convert: true,
    stripUnknown: true,
    abortEarly: false,
  });