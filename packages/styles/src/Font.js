/**
 * Font configuration following shadcn/ui defaults
 */
export const FontFamily = Object.freeze({
  /**
   * UI / body / headings
   * shadcn default: Inter
   */
  sans: [
    "Inter",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "'Segoe UI'",
    "sans-serif",
  ].join(", "),

  /**
   * Code / mono
   * shadcn default: Geist Mono
   */
  mono: [
    "'Geist Mono'",
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "'Liberation Mono'",
    "'Courier New'",
    "monospace",
  ].join(", "),
})
