// src/store/store.js
import { combineReducers } from "@reduxjs/toolkit";
import themeSlice from "./theme/theme-slice";
import authSlice from "./auth/auth-slice";

export const store = combineReducers({
  theme: themeSlice,
  auth: authSlice,
});
