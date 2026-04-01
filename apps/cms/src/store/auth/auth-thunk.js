import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../lib/supabase";
import { me } from "../../services/user-services";

/**
 * Initiates the authentication process by sending a magic link to the provided email address.
 *
 * @param {Object} payload - The payload object containing the user's email.
 * @param {string} payload.email - The email address to send the authentication link to.
 * @returns {Promise<{message: string}>} A promise that resolves to a success message upon successfully sending the email.
 */
export const signInWithOtp = createAsyncThunk(
  "auth/signInWithOtp",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${import.meta.env.VITE_BASE_URL}/auth/callback`,
        },
      });

      if (error) throw error;

      return {
        message: `We’ve sent a secure sign-in link to ${email}. Please check your inbox and follow the link to continue.`,
      };
    } catch (err) {
      return rejectWithValue(
        err?.message ||
          "Unable to send the sign-in link right now. Please try again in a moment."
      );
    }
  }
);

/**
 * Retrieves the currently authenticated user's profile data from the server.
 *
 * @returns {Promise<Object>} A promise that resolves to the current user's profile object.
 */
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const user = await me();
      return user;
    } catch (err) {
      return rejectWithValue(null);
    }
  }
);

/**
 * Signs out the currently authenticated user and securely terminates their active session.
 *
 * @returns {Promise<{message: string}>} A promise that resolves to a success message upon successful logout.
 */
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return {
        message: "You have been signed out successfully.",
      };
    } catch (err) {
      return rejectWithValue(
        err?.message || "Unable to sign out right now. Please try again."
      );
    }
  }
);


/**
 * Initiates a third-party authentication flow using Google OAuth.
 *
 * @returns {Promise<void>} Triggers the external redirect for Google authentication.
 */
export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${import.meta.env.VITE_BASE_URL}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      return rejectWithValue(err?.message || "Google sign-in is unavailable.");
    }
  }
);

/**
 * Initiates a third-party authentication flow using GitHub OAuth.
 *
 * @returns {Promise<void>} Triggers the external redirect for GitHub authentication.
 */
export const loginWithGithub = createAsyncThunk(
  "auth/loginWithGithub",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${import.meta.env.VITE_BASE_URL}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      return rejectWithValue(err?.message || "GitHub sign-in is unavailable.");
    }
  }
);