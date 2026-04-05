import { Box, useTheme, alpha } from "@mui/material";

const DotGridDeco = ({ sx }) => {
  const theme = useTheme();
  const dotColor = alpha(theme.palette.text.disabled, 0.25);

  return (
    <Box
      sx={{
        position: "absolute",
        width: 250,
        height: 250,
        zIndex: -2,
        pointerEvents: "none",
        backgroundImage: `radial-gradient(${dotColor} 2px, transparent 2px)`,
        backgroundSize: "24px 24px",
        maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        ...sx,
      }}
    />
  );
};

export default DotGridDeco;