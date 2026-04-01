import { createSlice } from "@reduxjs/toolkit";
import {
  getCurrentUser,
  signInWithOtp,
  logout as logoutThunk,
} from "./auth-thunk";

const initialState = {
  user: null,
  status: "idle",
  isInitialized: false,
  error: null,
  message: null,
};

/**
 * Redux slice responsible for managing the authentication state and lifecycle.
 */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.status = "success";
      state.isInitialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithOtp.pending, (state) => {
        state.status = "loading";
        state.error = null;
        state.message = null;
      })
      .addCase(signInWithOtp.fulfilled, (state, action) => {
        state.status = "success";
        state.message = action.payload.message;
        state.isInitialized = true;
      })
      .addCase(signInWithOtp.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload;
      })
      .addCase(getCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.status = "error";
        state.user = null;
        state.isInitialized = true;
      })
      .addCase(logoutThunk.fulfilled, () => ({
        ...initialState,
        isInitialized: true,
      }));
  },
});

export const { setUser, clearError, clearMessage } = authSlice.actions;
export default authSlice.reducer;