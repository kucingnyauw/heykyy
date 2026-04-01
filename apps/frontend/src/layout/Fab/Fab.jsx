import React, { useState, useCallback, memo } from "react";
import { alpha, Box } from "@mui/material";
import { keyframes } from "@mui/system";

import { FilledButton } from "@heykyy/components";
import FabFade from "./FabFade";

/**
 * Keyframes untuk animasi berkedip pada mata bot.
 */
const blinkAnimation = keyframes`
  0%, 88%, 92%, 96%, 100% { transform: scaleY(1); }
  90%, 94% { transform: scaleY(0.1); }
`;

/**
 * Keyframes untuk animasi melompat (jump) pada ikon bot.
 */
const jumpAnimation = keyframes`
  0%, 75%, 100% { transform: translateY(0); }
  80% { transform: translateY(-4px); }
  85% { transform: translateY(0); }
  90% { transform: translateY(-4px); }
  95% { transform: translateY(0); }
`;

/**
 * Komponen ikon SVG bot yang memiliki animasi melompat dan berkedip secara otomatis.
 *
 * @param {object} props - Properti komponen.
 * @param {number} [props.size=26] - Ukuran proporsional lebar dan tinggi ikon.
 * @returns {JSX.Element}
 */
const AnimatedBot = memo(({ size = 26 }) => (
  <Box
    component="svg"
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    sx={{
      animation: `${jumpAnimation} 4s ease-in-out infinite`,
      "& .eye": {
        animation: `${blinkAnimation} 4s infinite`,
        transformOrigin: "center",
        transformBox: "fill-box",
      },
    }}
  >
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path className="eye" d="M15 13v2" />
    <path className="eye" d="M9 13v2" />
  </Box>
));

/**
 * Komponen utama Floating Action Button (FAB) yang mengontrol status buka/tutup form.
 *
 * @returns {JSX.Element}
 */
const Fab = () => {
  const [open, setOpen] = useState(false);

  /**
   * Mengubah status (toggle) antara buka dan tutup.
   */
  const toggleForms = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  /**
   * Memaksa penutupan form.
   */
  const closeForms = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <FilledButton
      size="medium"
        onClick={toggleForms}
        startIcon={<AnimatedBot size={26} />}
        sx={{
          position: "fixed",
          bottom: { xs: 88, sm: 104, md: 32, lg: 40 }, 
          right: { xs: 16, sm: 24, md: 32, lg: 40 },
          zIndex: (theme) => theme.zIndex.appBar + 2,
          borderRadius: "50%",
          width: { xs: 48, md: 56 },
          height: { xs: 48, md: 56 },
          minWidth: 0,
          border: "none",
          boxShadow: (theme) =>
            `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
          transform: open ? "rotate(180deg) scale(0.9)" : "rotate(0deg) scale(1)",
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      />

      <FabFade isOpen={open} onClose={closeForms} />
    </>
  );
};

export default memo(Fab);