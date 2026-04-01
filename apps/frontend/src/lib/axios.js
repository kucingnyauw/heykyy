// src/services/api.js
import axios from "axios";
import { supabase } from "./supabase";
import { createLogger } from "../utils/logger";

const Logger = createLogger("API");

export const Client = (() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiVersion = import.meta.env.VITE_API_VERSION || "v1";

  if (!apiUrl)
    throw new Error("VITE_API_URL is not defined in environment variables.");

  const baseURL = `${apiUrl}/api/${apiVersion}`;
  const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 60000);
  const RETRY_COUNT = Number(import.meta.env.VITE_API_RETRY_COUNT || 2);
  const RETRY_DELAY = Number(import.meta.env.VITE_API_RETRY_DELAY || 1000);
  const BACKOFF = Number(import.meta.env.VITE_API_RETRY_BACKOFF || 2);

  const client = axios.create({
    baseURL,
    timeout: TIMEOUT,
    headers: { "Content-Type": "application/json" },
  });

  client.interceptors.request.use(
    async (config) => {
      try {
        const { data: { session } = {} } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch (err) {
        Logger.warn("Failed to attach Supabase token:", err);
      }

      Logger.debug(
        "Request:",
        config.method?.toUpperCase(),
        config.url,
        config.data ? JSON.stringify(config.data, null, 2) : ""
      );

      return config;
    },
    (error) => {
      Logger.error("Request error:", error);
      return Promise.reject(error);
    }
  );

  client.interceptors.response.use(
    (response) => {
      Logger.debug(
        "Response:",
        response.status,
        response.config.url,
        response.data ? JSON.stringify(response.data, null, 2) : ""
      );
      return response;
    },
    async (error) => {
      const config = error.config;
      if (!config) return Promise.reject(error);
      if (config._skipAuth) return Promise.reject(error);

      const status = error?.response?.status;

      if (status === 401) {
        Logger.warn("Unauthorized, redirecting to login:", config.url);
        window.location.replace("/login");
        return Promise.reject(error);
      }

      config.__retryCount = config.__retryCount || 0;

      if (config.__retryCount < RETRY_COUNT) {
        config.__retryCount += 1;
        const delay = RETRY_DELAY * Math.pow(BACKOFF, config.__retryCount - 1);
        Logger.info(
          `Retrying request ${config.url} (#${config.__retryCount}) after ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return client(config);
      }

      Logger.error(
        "API Error:",
        status,
        config.url,
        error.message,
        error?.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : ""
      );

      return Promise.reject(error);
    }
  );

  return client;
})();
