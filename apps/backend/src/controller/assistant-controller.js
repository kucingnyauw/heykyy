import { AsyncHandler, CommonUtils } from "@heykyy/utils-backend";
import AssistantService from "../service/assistant-service.js";

/**
 * Controller for managing AI-driven interactions and automated content generation.
 * This class acts as the interface between HTTP requests and the AssistantService.
 */
class AssistantController {
  /**
   * Facilitates a conversational interaction with the AI portfolio guide (Rivo).
   * Orchestrates the process of identifying the user and retrieving a context-aware AI response.
   * * @param {import("express").Request} req - Express request with authenticated user session.
   * @param {import("express").Response} res - Express response for chat delivery.
   */
  ask = AsyncHandler.catch(async (req, res) => {
    const ip = CommonUtils.getClientIp(req);

    const identifier = CommonUtils.hashIp(ip);

    const response = await AssistantService.askAssistant(identifier, req.body);

    res.status(200).json({
      success: true,
      message: "Rivo successfully processed your inquiry.",
      data: response.answer,
    });
  });

  /**
   * Triggers the AI generation engine to produce technical blog content.
   * Designed for administrative use to streamline the technical writing process.
   * * @param {import("express").Request} req - Express request containing the content prompt.
   * @param {import("express").Response} res - Express response with structured blog DTO.
   */
  generateBlogContent = AsyncHandler.catch(async (req, res) => {
    const result = await AssistantService.generateBlogContent(req.body);

    res.status(200).json({
      success: true,
      message: "AI has successfully drafted the blog content.",
      data: result,
    });
  });

  /**
   * Orchestrates the AI engine to draft a professional project case study.
   * Translates brief project descriptions into detailed, storytelling-based portfolio entries.
   * * @param {import("express").Request} req - Express request containing project context.
   * @param {import("express").Response} res - Express response with structured project DTO.
   */
  generateProjectContent = AsyncHandler.catch(async (req, res) => {
    const result = await AssistantService.generateProjectContent(req.body);

    res.status(200).json({
      success: true,
      message: "AI has successfully drafted the project case study.",
      data: result,
    });
  });
}

export default new AssistantController();
