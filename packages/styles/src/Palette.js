/**
 * @typedef {Object} ColorGroup
 * @property {string} background
 * @property {string} foreground
 * @property {string} card
 * @property {string} cardForeground
 * @property {string} popover
 * @property {string} popoverForeground
 * @property {string} primary
 * @property {string} primaryForeground
 * @property {string} secondary
 * @property {string} secondaryForeground
 * @property {string} accent
 * @property {string} accentForeground
 * @property {string} muted
 * @property {string} mutedForeground
 * @property {string} destructive
 * @property {string} destructiveForeground
 * @property {string} border
 * @property {string} input
 * @property {string} ring
 * @property {string} info
 * @property {string} success
 * @property {string} warning
 */

/**
 * @typedef {Object} ThemePalette
 * @property {Readonly<ColorGroup>} cms
 * @property {Readonly<ColorGroup>} frontend
 */

/**
 * Helper untuk deep freeze object.
 * @template T
 * @param {T} obj
 * @returns {Readonly<T>}
 */
const deepFreeze = (obj) => {
  Object.values(obj).forEach((value) => {
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
};

/**
 * Light mode palette.
 * @type {Readonly<ThemePalette>}
 */
export const LightPalette = deepFreeze({
  cms: {
    background: "#f8f8f8",
    foreground: "#2c2c2c",
    card: "#ffffff",
    cardForeground: "#2c2c2c",
    popover: "#ffffff",
    popoverForeground: "#2c2c2c",
    primary: "#1a1a1a",
    primaryForeground: "#ffffff",
    secondary: "#f4f4f5",
    secondaryForeground: "#4a4a4a",
    accent: "#e6e6e6",
    accentForeground: "#2c2c2c",
    muted: "#f6f6f6",
    mutedForeground: "#7a7a7a",
    destructive: "#3b3b3b",
    destructiveForeground: "#ffffff",
    border: "#e6e6e6",
    input: "#ffffff",
    ring: "#1a1a1a",
    info: "#3b3b3b",
    success: "#292929",
    warning: "#555555",
  },

  frontend: {
    background: "#ffffff",
    foreground: "#0e0e0e",
    card: "#ffffff",
    cardForeground: "#0e0e0e",
    popover: "#ffffff",
    popoverForeground: "#0e0e0e",
    primary: "#0e0e0e",
    primaryForeground: "#ffffff",
    secondary: "#f4f4f5",
    secondaryForeground: "#0e0e0e",
    accent: "#e6e6e6",
    accentForeground: "#0e0e0e",
    muted: "#f6f6f6",
    mutedForeground: "#727272",
    destructive: "#3b3b3b",
    destructiveForeground: "#ffffff",
    border: "#e6e6e6",
    input: "#ffffff",
    ring: "#0e0e0e",
    info: "#3b3b3b",
    success: "#292929",
    warning: "#555555",
  },
});

/**
 * Dark mode palette.
 * @type {Readonly<ThemePalette>}
 */
export const DarkPalette = deepFreeze({
  cms: {
    background: "#1a1a1a",
    foreground: "#d4d4d4",
    card: "#151515",
    cardForeground: "#d4d4d4",
    popover: "#1a1a1a",
    popoverForeground: "#d4d4d4",
    primary: "#e0e0e0",
    primaryForeground: "#0e0e0e",
    secondary: "#1f1f1f",
    secondaryForeground: "#b0b0b0",
    accent: "#292929",
    accentForeground: "#d4d4d4",
    muted: "#1a1a1a",
    mutedForeground: "#8c8c8c",
    destructive: "#3b3b3b",
    destructiveForeground: "#e6e6e6",
    border: "#333333",
    input: "#1a1a1a",
    ring: "#727272",
    info: "#8c8c8c",
    success: "#a4a4a4",
    warning: "#555555",
  },

  frontend: {
    background: "#0e0e0e",
    foreground: "#e6e6e6",
    card: "#151515",
    cardForeground: "#e6e6e6",
    popover: "#1a1a1a",
    popoverForeground: "#e6e6e6",
    primary: "#e6e6e6",
    primaryForeground: "#0e0e0e",
    secondary: "#1f1f1f",
    secondaryForeground: "#e6e6e6",
    accent: "#292929",
    accentForeground: "#e6e6e6",
    muted: "#1a1a1a",
    mutedForeground: "#8c8c8c",
    destructive: "#3b3b3b",
    destructiveForeground: "#e6e6e6",
    border: "#333333",
    input: "#1a1a1a",
    ring: "#727272",
    info: "#8c8c8c",
    success: "#a4a4a4",
    warning: "#555555",
  },
});