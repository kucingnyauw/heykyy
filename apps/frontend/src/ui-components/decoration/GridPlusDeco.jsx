import { Box, useTheme, alpha } from "@mui/material";

const GridPlusDeco = ({ sx }) => {
  const theme = useTheme();
  const color = alpha(theme.palette.divider, 0.5);

  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        maxWidth: 400,
        height: 200,
        zIndex: -2,
        pointerEvents: "none",
        backgroundImage: `
          linear-gradient(${color} 1px, transparent 1px),
          linear-gradient(90deg, ${color} 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        ...sx,
      }}
    />
  );
};

export default GridPlusDeco;