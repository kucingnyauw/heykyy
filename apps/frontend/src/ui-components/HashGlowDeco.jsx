/**
 * Komponen dekorasi berbentuk silang dengan efek cahaya (glow).
 * * @param {Object} props - Properti komponen
 * @param {Object} [props.sx] - Styling tambahan dari MUI
 * @returns {JSX.Element} Elemen dekorasi glow
 */
import React, { memo } from "react";
import { Box, useTheme, alpha } from "@mui/material";

const HashGlowDeco = memo(({ sx }) => {
  const theme = useTheme();
  const color = alpha(theme.palette.divider, 0.6);
  const glowColor = theme.palette.mode === "dark" ? "#fff" : theme.palette.primary.main;
  const gradientV = `linear-gradient(to bottom, transparent, ${color} 20%, ${color} 80%, transparent)`;
  const gradientH = `linear-gradient(to right, transparent, ${color} 20%, ${color} 80%, transparent)`;

  return (
    <Box
      sx={{
        position: "absolute",
        width: 300,
        height: 300,
        zIndex: -2,
        pointerEvents: "none",
        ...sx,
      }}
    >
      <Box sx={{ position: "absolute", width: "1px", height: "100%", left: "33%", background: gradientV }} />
      <Box sx={{ position: "absolute", width: "1px", height: "100%", left: "66%", background: gradientV }} />
      <Box sx={{ position: "absolute", height: "1px", width: "100%", top: "33%", background: gradientH }} />
      <Box sx={{ position: "absolute", height: "1px", width: "100%", top: "66%", background: gradientH }} />
      {[
        { top: "33%", left: "33%" },
        { top: "33%", left: "66%" },
        { top: "66%", left: "33%" },
        { top: "66%", left: "66%" },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 4,
            height: 4,
            left: `calc(${pos.left} - 1.5px)`,
            top: `calc(${pos.top} - 1.5px)`,
            bgcolor: glowColor,
            boxShadow: `0 0 10px ${glowColor}`,
            borderRadius: "50%",
            opacity: 0.8,
          }}
        />
      ))}
    </Box>
  );
});

export default HashGlowDeco;