// src/store/store.js
import { combineReducers } from "@reduxjs/toolkit";
import authSlice from "./auth/auth-slice";
import themeSlice from "./theme/theme-slice";
import sidebarSlice from "./sidebar/sidebar-slice";

export const store = combineReducers({
  auth: authSlice,
  theme : themeSlice ,
  sidebar : sidebarSlice ,
});
