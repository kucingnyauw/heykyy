import Joi from "joi";

/**
 * Validation schema for interactive assistant queries.
 * Limits the message length to prevent excessively long prompts that consume unnecessary tokens.
 */
export const askAssistantSchema = Joi.object({
  message: Joi.string().trim().min(2).max(300).required().messages({
    "string.base": "The message must be a valid text string.",
    "string.empty": "The message cannot be empty.",
    "string.min": "Please provide a message of at least 2 characters.",
    "string.max": "Your message is too long. Please keep it under 300 characters.",
    "any.required": "A message is required to interact with the assistant.",
  }),
});

/**
 * Validation schema for AI-driven blog content generation.
 * Requires enough context (min 10 chars) but caps at 1000 characters to ensure the AI stays focused.
 */
export const generateBlogContentSchema = Joi.object({
  prompt: Joi.string().trim().min(10).max(1000).required().messages({
    "string.base": "The prompt must be a valid text string.",
    "string.empty": "The prompt cannot be empty.",
    "string.min": "Please provide a more detailed prompt (at least 10 characters) for better results.",
    "string.max": "The prompt cannot exceed 1000 characters.",
    "any.required": "A prompt is strictly required to generate blog content.",
  }),
});

/**
 * Validation schema for AI-driven project case study generation.
 * Requires enough context (min 10 chars) but caps at 1000 characters to ensure the AI stays focused.
 */
export const generateProjectContentSchema = Joi.object({
  prompt: Joi.string().trim().min(10).max(1000).required().messages({
    "string.base": "The prompt must be a valid text string.",
    "string.empty": "The prompt cannot be empty.",
    "string.min": "Please provide a more detailed prompt (at least 10 characters) for better results.",
    "string.max": "The prompt cannot exceed 1000 characters.",
    "any.required": "A prompt is strictly required to generate a project case study.",
  }),
});