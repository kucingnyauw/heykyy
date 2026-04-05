import { Client } from "../lib/axios";
import { ResponseHandler } from "@heykyy/utils";

/**
 * Mengirim pertanyaan ke AI assistant dan mengembalikan responsnya.
 *
 * @param {string} message Teks pertanyaan atau prompt dari user.
 * @returns {Promise<any>} Data respons dari AI assistant.
 *
 * @throws {Error} Jika message kosong.
 * @throws {string|Error} Error hasil transform dari ResponseHandler jika request gagal.
 */
export async function askAssistant(message) {
  if (!message || typeof message !== "string") {
    throw new Error("Invalid message. A non-empty string is required.");
  }

  try {
    const response = await Client.post("/ai/ask", { message });

    return ResponseHandler.handleSuccess(response.data, (res) => res.data);
  } catch (error) {
    throw ResponseHandler.handleError(error, (_, msg) => msg);
  }
}