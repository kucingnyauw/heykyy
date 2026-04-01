import Joi from "joi";

/**
 * Validation schema for creating a new comment or a reply.
 * Requires content and an optional parentId for nested replies.
 */
export const createCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(3)
    .max(1000)
    .required()
    .messages({
      "string.base": "The comment content must be a valid text string.",
      "string.empty": "The comment cannot be empty.",
      "string.min": "The comment must be at least 3 characters long.",
      "string.max": "The comment cannot exceed 1000 characters.",
      "any.required": "The content field is mandatory to post a comment.",
    }),

  parentId: Joi.string()
    .uuid()
    .allow(null, "")
    .empty("")
    .default(null)
    .messages({
      "string.guid": "The Parent ID must be a valid UUID format if provided.",
    }),
}).prefs({ convert: true, stripUnknown: true, abortEarly: false });

/**
 * Validation schema for updating an existing comment.
 * Only allows modification of the content field and ensures it is not empty.
 */
export const updateCommentSchema = Joi.object({
  content: Joi.string()
    .trim()
    .min(3)
    .max(1000)
    .required()
    .messages({
      "string.base": "The updated content must be a valid text string.",
      "string.empty": "The updated content cannot be empty.",
      "string.min": "The updated content must be at least 3 characters long.",
      "string.max": "The updated content cannot exceed 1000 characters.",
      "any.required": "The content field is required to perform an update.",
    }),
}).prefs({ convert: true, stripUnknown: true, abortEarly: false });