import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils-frontend";

/**
 * Submits a user's inquiry or message to the AI portfolio assistant (Rivo).
 * Validates the presence of the message before sending a POST request to the AI service.
 * * @param {string} message - The text message, question, or prompt provided by the user.
 * @returns {Promise<Object>} A promise resolving to the AI assistant's generated response data.
 * @throws {string|Error} Throws a formatted error string if the API request fails (e.g., rate limits exceeded), or an Error object if the message is missing.
 */
export const askAssistant = async (message) => {
  if (!message) {
    throw new Error("Message is required to ask the assistant.");
  }

  try {
    const res = await Client.post("/ai/ask", {
      message,
    });

    return ResponseHandler.handleSuccess(res.data, ({ data }) => data);
  } catch (error) {
    throw ResponseHandler.handleError(
      error,
      (code, message) => message
    );
  }
};