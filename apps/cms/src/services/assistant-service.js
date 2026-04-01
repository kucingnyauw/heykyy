import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Initiates an AI-driven generation of a comprehensive blog case study based on a given prompt.
 * Validates the input before sending a POST request to the API and securely parses the response.
 * * @param {string} prompt - The specific topic or set of instructions to guide the AI's content generation.
 * @returns {Promise<Object>} A promise that resolves to the generated blog content structure.
 * @throws {Error} Throws an error if the prompt is undefined/empty or if the API request fails.
 */
export const generateBlogCaseStudy = async (prompt) => {
  if (!prompt) {
    throw new Error("Prompt is required to generate a blog case study.");
  }

  try {
    const res = await Client.post("/ai/generate-blog", {
      prompt,
    });

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};

/**
 * Initiates an AI-driven generation of a professional project case study based on a given prompt.
 * Validates the input before sending a POST request to the API and securely parses the response.
 * * @param {string} prompt - The project details or specific instructions to guide the AI's generation process.
 * @returns {Promise<Object>} A promise that resolves to the generated project case study structure.
 * @throws {Error} Throws an error if the prompt is undefined/empty or if the API request fails.
 */
export const generateProjectCaseStudy = async (prompt) => {
  if (!prompt) {
    throw new Error("Prompt is required to generate a project case study.");
  }

  try {
    const res = await Client.post("/ai/generate-project", {
      prompt,
    });

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (code, message) => message);
  }
};