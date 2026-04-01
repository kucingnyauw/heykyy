/**
 * @fileoverview Interactive background effect components for the Homepage.
 * Provides subtle, dynamic visuals like shooting stars and a parallax moon overlay.
 */

import React, { useMemo, memo } from "react";
import { Box, alpha, useTheme } from "@mui/material";
import { motion } from "framer-motion";

import { useParallax } from "../../../hooks/use-paralax";
import moon2 from "../../../assets/area2.webp";
import { starFall } from "./HomeShared";

/**
 * Renders a layer of continuously falling shooting stars.
 * Uses CSS animations generated via styled-components keyframes.
 * * @returns {JSX.Element} The shooting stars background layer.
 */
export const Stars = memo(() => {
  const starsConfig = useMemo(
    () => [
      { left: "15%", height: 80, duration: "18s" },
      { left: "35%", height: 60, duration: "22s", delay: "4s" },
      { left: "55%", height: 100, duration: "16s" },
      { left: "75%", height: 70, duration: "24s", delay: "6s" },
    ],
    []
  );

  return (
    <Box sx={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 9 }}>
      {starsConfig.map((star, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: "-20%",
            left: star.left,
            width: "0.5px",
            height: star.height,
            background: "linear-gradient(180deg, rgba(220,235,255,0.6), transparent)",
            animation: `${starFall} ${star.duration} linear infinite`,
            animationDelay: star.delay || "0s",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-1px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "1px",
              height: "1px",
              borderRadius: "50%",
              background: "rgba(235,245,255,0.8)",
            },
          }}
        />
      ))}
    </Box>
  );
});

/**
 * Renders an interactive, parallax-scrolling moon with radiant glows.
 * This effect is exclusively visible in dark mode to preserve contrast and aesthetics.
 * * @returns {JSX.Element|null} The moon overlay, or null if the app is in light mode.
 */
export const Moon = memo(() => {
  const theme = useTheme();
  const yRange = useParallax(0.15);

  if (theme.palette.mode !== "dark") return null;

  const glowStyle = {
    position: "absolute",
    width: "40vw",
    height: "60vh",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.4,
    zIndex: -1,
    pointerEvents: "none",
  };

  return (
    <Box sx={{ position: "fixed", top: 0, left: 0, right: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "none", overflow: "hidden" }}>
      <motion.div style={{ y: yRange, height: "100%", position: "relative" }}>
        <Box sx={{ ...glowStyle, left: "-10%", top: "10%", background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)` }} />
        <Box sx={{ ...glowStyle, right: "-10%", top: "20%", background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.2)} 0%, transparent 70%)` }} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.15,
            backgroundColor: "transparent",
            background: `url(${moon2}) center / cover no-repeat`,
            mixBlendMode: "screen",
            WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
          }}
        />
      </motion.div>
    </Box>
  );
});