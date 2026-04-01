import axios from "axios";
import { supabase } from "./supabase";

export const Client = (() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiVersion = import.meta.env.VITE_API_VERSION || "v1";

  if (!apiUrl) {
    throw new Error("VITE_API_URL is not defined in environment variables.");
  }

  const baseURL = `${apiUrl}/api/${apiVersion}`;

  const client = axios.create({
    baseURL,
    timeout: 300_000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  client.interceptors.request.use(
    async (config) => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.access_token) {
          config.headers.Authorization = `Bearer ${session.access_token}`;
        }
      } catch {}
      return config;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.config?._skipAuth) {
        return Promise.reject(error);
      }

      if (error?.response?.status === 401) {
        window.location.replace("/login");
      }

      return Promise.reject(error);
    }
  );

  return client;
})();