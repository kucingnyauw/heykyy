import Joi from "joi";

/**
 * Validation schema for creating a new project.
 * Enforces strict length limits, valid URLs, and structured data formats.
 */
export const createProjectSchema = Joi.object({
  status: Joi.string()
    .valid("DRAFT", "PUBLISHED", "ARCHIVED")
    .default("DRAFT")
    .messages({
      "any.only": "The status must be strictly DRAFT, PUBLISHED, or ARCHIVED.",
    }),

  title: Joi.string().min(3).max(150).required().messages({
    "string.base": "The title must be a valid text string.",
    "string.empty": "The title cannot be empty.",
    "string.min": "The title must be at least 3 characters long.",
    "string.max": "The title cannot exceed 150 characters.",
    "any.required": "A project title is strictly required.",
  }),

  demoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "The Demo URL must be a valid URL format.",
  }),

  repoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "The Repository URL must be a valid URL format.",
  }),

  categoryId: Joi.string().uuid().allow(null, "").messages({
    "string.guid": "The Category ID must be a valid UUID.",
  }),

  stackIds: Joi.alternatives()
    .try(Joi.array().items(Joi.string().uuid()), Joi.string().uuid())
    .custom((value) => (typeof value === "string" ? [value] : value))
    .messages({
      "string.guid": "Each Stack ID must be a valid UUID.",
    }),

  contentHtml: Joi.string().allow(null, "").min(20).max(50000).messages({
    "string.min": "The HTML content must be at least 20 characters long.",
    "string.max": "The HTML content cannot exceed 50,000 characters.",
  }),

  summary: Joi.string().allow(null, "").min(20).max(300).messages({
    "string.min": "The summary must be at least 20 characters long.",
    "string.max": "The summary cannot exceed 300 characters.",
  }),

  metaTitle: Joi.string().allow(null, "").min(10).max(60).messages({
    "string.min": "The meta title must be at least 10 characters long.",
    "string.max": "The meta title cannot exceed 60 characters.",
  }),

  metaDesc: Joi.string().allow(null, "").min(20).max(160).messages({
    "string.min": "The meta description must be at least 20 characters long.",
    "string.max": "The meta description cannot exceed 160 characters.",
  }),

  isFeatured: Joi.boolean().truthy("true").falsy("false"),
}).prefs({ convert: true, stripUnknown: true });

/**
 * Validation schema for updating an existing project.
 * All fields are optional but must meet formatting rules if provided.
 * Requires at least one field to be present for the update.
 */
export const updateProjectSchema = Joi.object({
  title: Joi.string().min(3).max(150).messages({
    "string.base": "The title must be a valid text string.",
    "string.empty": "The title cannot be empty.",
    "string.min": "The title must be at least 3 characters long.",
    "string.max": "The title cannot exceed 150 characters.",
  }),

  demoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "The Demo URL must be a valid URL format.",
  }),

  repoUrl: Joi.string().uri().allow(null, "").messages({
    "string.uri": "The Repository URL must be a valid URL format.",
  }),

  categoryId: Joi.string().uuid().allow(null, "").messages({
    "string.guid": "The Category ID must be a valid UUID.",
  }),

  stackIds: Joi.alternatives()
    .try(Joi.array().items(Joi.string().uuid()), Joi.string().uuid())
    .custom((value) => (typeof value === "string" ? [value] : value))
    .messages({
      "string.guid": "Each Stack ID must be a valid UUID.",
    }),

  status: Joi.string().valid("DRAFT", "PUBLISHED", "ARCHIVED").messages({
    "any.only": "The status must be strictly DRAFT, PUBLISHED, or ARCHIVED.",
  }),

  contentHtml: Joi.string().allow(null, "").min(20).max(50000).messages({
    "string.min": "The HTML content must be at least 20 characters long.",
    "string.max": "The HTML content cannot exceed 50,000 characters.",
  }),

  summary: Joi.string().allow(null, "").min(20).max(300).messages({
    "string.min": "The summary must be at least 20 characters long.",
    "string.max": "The summary cannot exceed 300 characters.",
  }),

  metaTitle: Joi.string().allow(null, "").min(10).max(60).messages({
    "string.min": "The meta title must be at least 10 characters long.",
    "string.max": "The meta title cannot exceed 60 characters.",
  }),

  metaDesc: Joi.string().allow(null, "").min(20).max(160).messages({
    "string.min": "The meta description must be at least 20 characters long.",
    "string.max": "The meta description cannot exceed 160 characters.",
  }),

  isFeatured: Joi.boolean().truthy("true").falsy("false"),

  existingImageIds: Joi.alternatives()
    .try(Joi.array().items(Joi.string().uuid()), Joi.string().uuid())
    .custom((value) => (typeof value === "string" ? [value] : value))
    .messages({
      "string.guid": "Each existing image ID must be a valid UUID.",
    }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided to perform an update.",
  })
  .prefs({ convert: true, stripUnknown: true });
