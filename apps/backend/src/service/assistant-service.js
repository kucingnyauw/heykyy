import { ApiError } from "@heykyy/utils-backend";
import { getPrisma } from "../application/database.js";
import { redis } from "../lib/redis.js";
import { MAX_DELAY, MAX_USAGE } from "@heykyy/constant";
import { validate } from "../validation/validation.js";
import {
  askAssistantSchema,
  generateBlogContentSchema,
  generateProjectContentSchema,
} from "../validation/assistant-validations.js";
import {
  GeneratedBlogDto,
  GeneratedProjectDto,
  AssistantChatDto,
} from "../dtos/assistant-dtos.js";
import axios from "axios";
import crypto from "crypto";

class AssistantService {
  /**
   * Initializes the AssistantService and sets up the Redis client.
   */
  constructor() {
    this.redis = redis;
  }

  /**
   * Gets the Prisma client instance.
   * * @returns {import('@prisma/client').PrismaClient} The Prisma client.
   */
  get prisma() {
    return getPrisma();
  }

  /**
   * Processes a user query directed at the AI portfolio assistant.
   * Handles rate limiting, caching, context retrieval, and AI communication.
   * * @param {string} ip - The IP address of the user making the request.
   * @param {Object} request - The request payload.
   * @param {string} request.message - The message/question from the user.
   * @returns {Promise<AssistantChatDto>} The AI's response wrapped in a DTO.
   * @throws {ApiError} Throws an error if rate limits are exceeded or the AI service is unavailable.
   */
  async askAssistant(ip, request) {
    const { message } = validate(askAssistantSchema, request);

    await this.#storeRequest(ip);

    const historyKey = `assistant:history:${ip}`;
    const rawHistory = await this.redis.get(historyKey).catch(() => null);
    const history = rawHistory
      ? typeof rawHistory === "string"
        ? JSON.parse(rawHistory)
        : rawHistory
      : [];

    const hash = crypto
      .createHash("sha256")
      .update(message.toLowerCase().trim())
      .digest("hex")
      .slice(0, 16);
    const cacheKey = `assistant:ask:${ip}:${hash}`;
    const cachedAnswer = await this.redis.get(cacheKey).catch(() => null);

    if (cachedAnswer) return new AssistantChatDto(cachedAnswer);

    const adminData = await this.#storeDatabase();

    const contextData = {
      profile: {
        name: adminData.name,
        bio: adminData.about,
        education: adminData.education.map((e) => ({
          school: e.institution,
          year: `${new Date(e.startYear).getFullYear()} - ${
            e.endYear ? new Date(e.endYear).getFullYear() : "Present"
          }`,
        })),
        skills: adminData.projects
          .flatMap((p) => p.stacks.map((s) => s.stack.name))
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 12),
        cvUrl: adminData.cvs?.[0]?.file?.url || null,
      },
      works: adminData.projects.map((p) => ({
        title: p.title,
        summary: p.summary,
        stacks: p.stacks.map((s) => s.stack.name).join(", "),
        link: `${process.env.FRONTEND_URL}/projects/${p.slug}`,
      })),
    };

    const systemPrompt = `You are Rivo, the official and exclusive AI Assistant for ${
      contextData.profile.name
    }'s Portfolio. Your primary mission is to guide visitors, highlight ${
      contextData.profile.name
    }'s expertise, and leave a memorable professional impression.

    CORE BEHAVIORS & STRICT RULES:
    1. FORMATTING (CRITICAL): You render text directly into a custom web component. You must use ONLY the following HTML tags: <p>, <strong>, <ul>, <li>, and <a href="..." target="_blank">. 
       - ABSOLUTELY NO Markdown format. Never use asterisks (*), hashes (#), or backticks (\`).
       - DO NOT wrap your response in markdown blocks (e.g. no \`\`\`html). Output raw HTML directly.
       - Keep paragraphs concise and easy to scan.
       - LINK FORMATTING: NEVER output raw URLs in the text. Always format links as clickable text using the <a> tag. For example, instead of pasting a CV or project URL, use exactly: <a href="[url]" target="_blank">Click here</a> or <a href="[url]" target="_blank">View Project</a>.
    2. TONE & VOICE: Professional, modern, welcoming, and subtly witty. Be highly confident in ${
      contextData.profile.name
    }'s abilities without sounding arrogant.
    3. KNOWLEDGE BOUNDARIES: Base your answers STRICTLY on the provided CONTEXT. 
       - Missing Info: If asked something not in the context, you MUST explicitly state that there is no data by saying: "I have no data regarding this in my context," and then politely suggest reaching out to ${
         contextData.profile.name
       } directly to find out.
       - Off-Topic: If asked about topics unrelated to ${
         contextData.profile.name
       }'s portfolio (e.g., coding help, general trivia), politely decline and pivot back to their professional work.
    4. LANGUAGE: Respond exclusively in ENGLISH, regardless of the language the user types in.
    
    CONTEXT DATA:
    ${JSON.stringify(contextData)}
    
    Remember: You are the digital host. Make ${
      contextData.profile.name
    } look excellent!`;

    try {
      let answer = await this.#callAi(
        systemPrompt,
        message,
        false,
        800,
        0.6,
        history
      );

      answer = answer
        .replace(/^```(html)?\n?/gi, "")
        .replace(/```$/g, "")
        .trim();

      const updatedHistory = [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: answer },
      ].slice(-6);
      await this.redis
        .set(historyKey, JSON.stringify(updatedHistory), { ex: 3600 })
        .catch(() => null);
      await this.#storeResponse(message, ip, answer);

      return new AssistantChatDto(answer);
    } catch (error) {
      const limitKey = `rate:limit:assistant:${ip}`;
      await this.redis.decr(limitKey).catch(() => null);
      throw new ApiError(
        503,
        "Rivo is currently overcapacity. Please try again in a moment."
      );
    }
  }

  /**
   * Generates a fully structured blog post utilizing the AI model based on a user prompt.
   * * @param {Object} request - The request payload.
   * @param {string} request.prompt - The topic/prompt to base the blog content on.
   * @returns {Promise<GeneratedBlogDto>} The generated blog content details.
   */
  async generateBlogContent(request) {
    const { prompt } = validate(generateBlogContentSchema, request);
    const systemPrompt = `You are an elite Senior Tech Blogger and Technical SEO Expert. Your objective is to author a highly engaging, technically rigorous, and perfectly structured blog post written in fluent ENGLISH. 

    AUDIENCE & TONE:
    Target an audience of software engineers, tech enthusiasts, and IT professionals. The tone must be authoritative yet accessible, balancing deep technical accuracy with compelling readability. Ensure actionable takeaways.

    CRITICAL OUTPUT RULE: 
    You MUST output ONLY a raw, perfectly valid JSON object. Absolutely NO markdown formatting or code blocks (e.g., do NOT wrap the response in \`\`\`json). NO conversational filler, greetings, or conclusions. Your entire response must pass natively through JSON.parse().
    
    REQUIRED JSON FORMAT & CONSTRAINTS:
    {
      "title": "A highly clickable, SEO-optimized title (Max 65 characters)",
      "summary": "A punchy 2-3 sentence executive summary acting as a hook. State the core problem and the value of reading the post.",
      "contentHtml": "The full article body using clean, semantic HTML. Allowed tags ONLY: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, and <pre><code> for code blocks. Do NOT use markdown. Ensure logical heading hierarchies (start with <h2>).",
      "tags": ["array", "of", "3 to 5", "lowercase", "high-volume tech keywords"],
      "metaTitle": "SEO meta title incorporating primary keywords (Max 60 characters)",
      "metaDesc": "SEO meta description designed to drive high CTR (Max 155 characters)"
    }
    
    TOPIC TO WRITE ABOUT: 
    ${prompt}`;

    const response = await this.#callAi(systemPrompt, null, true, 2500, 0.7);
    return new GeneratedBlogDto(
      typeof response === "string" ? JSON.parse(response) : response
    );
  }

  /**
   * Generates a professional project case study utilizing the AI model based on a user prompt.
   * * @param {Object} request - The request payload.
   * @param {string} request.prompt - The details/prompt of the project to generate a case study for.
   * @returns {Promise<GeneratedProjectDto>} The generated case study content details.
   */
  async generateProjectContent(request) {
    const { prompt } = validate(generateProjectContentSchema, request);
    const systemPrompt = `You are a Principal Solutions Architect and Technical Lead. Your objective is to draft a comprehensive, highly professional, and analytical project case study written in fluent ENGLISH.

    AUDIENCE & TONE:
    Target stakeholders, engineering managers, and technical recruiters. The tone must be objective, analytical, and focused on business value, architectural decisions, and quantifiable outcomes. Use professional industry terminology.

    CRITICAL OUTPUT RULE:
    You MUST output ONLY a raw, perfectly valid JSON object. Absolutely NO markdown formatting or code blocks (e.g., do NOT wrap the response in \`\`\`json). NO conversational filler, greetings, or conclusions. Your entire response must pass natively through JSON.parse().
    
    REQUIRED JSON FORMAT & CONSTRAINTS:
    {
      "title": "Clear, professional, and descriptive project title (Max 65 characters)",
      "summary": "A high-level executive summary detailing the project's primary objectives, core technology stack, and overarching business impact (2-3 sentences).",
      "contentHtml": "The full case study using clean, semantic HTML. Allowed tags ONLY: <h2>, <h3>, <p>, <ul>, <li>, and <strong>. Do NOT use markdown.\\n\\nCRITICAL STRUCTURE: You must format the HTML content into exactly three distinct sections:\\n<h2>The Challenge</h2> (Detail the business problem, technical constraints, and project scope)\\n<h2>The Architecture & Solution</h2> (Explain system design, tech stack choices, and implementation details)\\n<h2>The Impact & Results</h2> (Highlight performance gains, business value, and quantifiable metrics if possible)",
      "metaTitle": "SEO optimized meta title for professional visibility (Max 60 characters)",
      "metaDesc": "SEO optimized meta description focusing on project scope and business value (Max 155 characters)"
    }
    
    PROJECT TOPIC / DETAILS:
    ${prompt}`;

    const response = await this.#callAi(systemPrompt, null, true, 2000, 0.7);
    return new GeneratedProjectDto(
      typeof response === "string" ? JSON.parse(response) : response
    );
  }

  /**
   * Internal helper method to interact with the OpenRouter AI API.
   * * @private
   * @param {string} systemPrompt - The system instructions directing the AI's behavior.
   * @param {string|null} userMessage - The specific query or prompt from the user.
   * @param {boolean} [isJson=false] - Flag to dictate if the API should explicitly enforce a JSON output format.
   * @param {number} [maxTokens=1000] - The maximum number of tokens allowed in the response.
   * @param {number} [temperature=0.5] - Output randomness/creativity control (0.0 to 1.0).
   * @param {Array<{role: string, content: string}>} [history=[]] - Array of previous chat messages for conversational context.
   * @returns {Promise<string|Object>} The response content generated by the AI model.
   */
  async #callAi(
    systemPrompt,
    userMessage,
    isJson = false,
    maxTokens = 1000,
    temperature = 0.5,
    history = []
  ) {
    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      ...(userMessage ? [{ role: "user", content: userMessage }] : []),
    ];

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3.1-8b-instruct",
        messages,
        temperature,
        max_tokens: maxTokens,
        ...(isJson && { response_format: { type: "json_object" } }),
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 50000,
      }
    );

    return response.data?.choices?.[0]?.message?.content?.trim();
  }

  /**
   * Retrieves and caches the admin user's portfolio context from the database to inject into the AI prompt.
   * * @private
   * @returns {Promise<Object>} An object containing the admin's profile, education, and published projects.
   */
  async #storeDatabase() {
    const key = "admin:portfolio:context";
    const cached = await this.redis.get(key).catch(() => null);

    if (cached) return typeof cached === "string" ? JSON.parse(cached) : cached;

    const user = await this.prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: {
        name: true,
        about: true,
        education: {
          select: { institution: true, startYear: true, endYear: true },
          orderBy: { startYear: "desc" },
        },
        projects: {
          where: { status: "PUBLISHED" },
          take: 6,
          select: {
            title: true,
            slug: true,
            summary: true,
            stacks: { select: { stack: { select: { name: true } } } },
          },
        },
        cvs: {
          where: { isMain: true },
          take: 1,
          select: { file: { select: { url: true } } },
        },
      },
    });

    await this.redis
      .set(key, JSON.stringify(user), { ex: 86400 })
      .catch(() => null);
    return user;
  }

  /**
   * Implements IP-based rate limiting to prevent API abuse.
   * * @private
   * @param {string} ip - The IP address of the incoming request.
   * @returns {Promise<void>}
   * @throws {ApiError} If the IP exceeds the MAX_USAGE within the specified time frame.
   */
  async #storeRequest(ip) {
    const key = `rate:limit:assistant:${ip}`;
    const hits = await this.redis.incr(key).catch(() => 1);
    if (hits === 1) await this.redis.expire(key, MAX_DELAY).catch(() => null);
    if (hits > MAX_USAGE) {
      throw new ApiError(
        429,
        "Daily inquiry limit reached. Please contact me via email."
      );
    }
  }

  /**
   * Caches the AI's response to a specific question to speed up future identical inquiries from the same IP.
   * * @private
   * @param {string} question - The user's original question.
   * @param {string} ip - The user's IP address.
   * @param {string} answer - The generated AI response.
   * @returns {Promise<void>}
   */
  async #storeResponse(question, ip, answer) {
    const hash = crypto
      .createHash("sha256")
      .update(question.toLowerCase().trim())
      .digest("hex")
      .slice(0, 16);
    await this.redis
      .set(`assistant:ask:${ip}:${hash}`, answer, { ex: 3600 })
      .catch(() => null);
  }

  /**
   * Clears the conversational history stored in Redis for a specific IP address.
   * * @param {string} ip - The IP address whose history should be deleted.
   * @returns {Promise<void>}
   */
  async clearHistory(ip) {
    await this.redis.del(`assistant:history:${ip}`).catch(() => null);
  }
}

export default new AssistantService();
