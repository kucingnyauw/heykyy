// shadcn/ui transition system (Tailwind default)

export const Transition = Object.freeze({
  /* ================= DURATION ================= */
  duration: {
    fast: "150ms",   // default cepat (hover, press)
    normal: "200ms", // DEFAULT shadcn
    slow: "300ms",   // modal, dropdown
  },

  /* ================= EASING ================= */
  easing: {
    linear: "linear",
    ease: "ease",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)", // DEFAULT
  },

  /* ================= PRESET ================= */
  preset: {
    default: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "all 150ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",

    opacity: "opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    transform: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    colors: "color 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms cubic-bezier(0.4, 0, 0.2, 1), border-color 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
});
