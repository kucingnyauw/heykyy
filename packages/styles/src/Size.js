/**
 * Design tokens untuk ukuran (size system).
 * Digunakan sebagai single source of truth untuk:
 * - Typography
 * - Spacing
 * - Radius
 * - Shadow
 * - Layout container
 * - Component sizing (button)
 *
 * Semua nilai bersifat immutable.
 *
 * @namespace Size
 */
export const Size = Object.freeze({
  /**
   * Font size scale (berbasis rem).
   * @type {Readonly<Record<string, string>>}
   */
  font: Object.freeze({
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem",
  }),

  /**
   * Spacing scale (pixel-based).
   * Cocok untuk margin, padding, gap.
   *
   * @type {Readonly<Record<string | number, string>>}
   */
  spacing: Object.freeze({
    0: "0px",
    0.5: "2px",
    1: "4px",
    1.5: "6px",
    2: "8px",
    2.5: "10px",
    3: "12px",
    3.5: "14px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "28px",
    8: "32px",
    9: "36px",
    10: "40px",
    11: "44px",
    12: "48px",
    14: "56px",
    16: "64px",
    20: "80px",
    24: "96px",
    28: "112px",
    32: "128px",
  }),

  /**
   * Border radius scale.
   * @type {Readonly<Record<string, string>>}
   */
  radius: Object.freeze({
    none: "0px",
    sm: "0.125rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    full: "9999px",
  }),

  /**
   * Shadow elevation scale.
   * Index merepresentasikan level elevasi.
   *
   * @type {Readonly<string[]>}
   */
  shadow: Object.freeze([
    "none", // 0
    "0 1px 2px rgba(0,0,0,0.05)", // 1
    "0 1px 2px rgba(0,0,0,0.05)", // 2
    "0 2px 6px rgba(0,0,0,0.08)", // 3
    "0 2px 6px rgba(0,0,0,0.08)", // 4
    "0 4px 10px rgba(0,0,0,0.10)", // 5
    "0 8px 16px rgba(0,0,0,0.12)", // 6
    "0 8px 16px rgba(0,0,0,0.12)", // 7
    "0 12px 24px rgba(0,0,0,0.14)", // 8
    "0 12px 24px rgba(0,0,0,0.14)", // 9
    "0 16px 32px rgba(0,0,0,0.16)", // 10
    "0 16px 32px rgba(0,0,0,0.16)", // 11
    "0 20px 40px rgba(0,0,0,0.18)", // 12
    "0 20px 40px rgba(0,0,0,0.18)", // 13
    "0 24px 48px rgba(0,0,0,0.20)", // 14
    "0 24px 48px rgba(0,0,0,0.20)", // 15
    "0 28px 56px rgba(0,0,0,0.22)", // 16
    "0 28px 56px rgba(0,0,0,0.22)", // 17
    "0 32px 64px rgba(0,0,0,0.24)", // 18
    "0 32px 64px rgba(0,0,0,0.24)", // 19
    "0 36px 72px rgba(0,0,0,0.26)", // 20
    "0 36px 72px rgba(0,0,0,0.26)", // 21
    "0 40px 80px rgba(0,0,0,0.28)", // 22
    "0 40px 80px rgba(0,0,0,0.28)", // 23
    "0 48px 96px rgba(0,0,0,0.30)", // 24
  ]),

  /**
   * Container max-width breakpoints.
   * @type {Readonly<Record<string, string>>}
   */
  container: Object.freeze({
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  }),

  /**
   * Button size variants.
   * Digunakan untuk standardisasi UI component.
   */
  button: Object.freeze({
    extraSmall: Object.freeze({
      height: "32px",
      padding: "0 12px",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.25rem",
    }),
    small: Object.freeze({
      height: "36px",
      padding: "0 14px",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.375rem",
    }),
    medium: Object.freeze({
      height: "40px",
      padding: "0 16px",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.5rem",
    }),
    large: Object.freeze({
      height: "48px",
      padding: "0 20px",
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.625rem",
    }),
    extraLarge: Object.freeze({
      height: "56px",
      padding: "0 24px",
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: "1.25",
      borderRadius: "0.75rem",
    }),

    /**
     * Icon-only button variants.
     */
    icon: Object.freeze({
      extraSmall: Object.freeze({
        size: "32px",
        padding: "4px",
        fontSize: "0.75rem",
      }),
      small: Object.freeze({
        size: "36px",
        padding: "4px",
        fontSize: "0.875rem",
      }),
      medium: Object.freeze({
        size: "40px",
        padding: "6px",
        fontSize: "0.875rem",
      }),
      large: Object.freeze({
        size: "48px",
        padding: "8px",
        fontSize: "1rem",
      }),
      extraLarge: Object.freeze({
        size: "56px",
        padding: "10px",
        fontSize: "1.125rem",
      }),
    }),
  }),
});