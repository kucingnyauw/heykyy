// src/store/selectors/theme.selectors.js

// Ambil mode theme
export const getThemeMode = (state) => state.theme.mode;

// Cek apakah dark mode
export const isDarkMode = (state) => state.theme.mode === "dark";

// Cek apakah light mode
export const isLightMode = (state) => state.theme.mode === "light";
