import { Box, alpha, useTheme } from "@mui/material";

const CrossDeco = ({ sx }) => {
  const theme = useTheme();
  const lineColor = alpha(theme.palette.divider, 0.5);

  return (
    <Box
      sx={{
        position: "absolute",
        width: 80,
        height: 80,
        zIndex: -2,
        pointerEvents: "none",
        ...sx
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "1px",
          top: "50%",
          bgcolor: lineColor
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "1px",
          height: "100%",
          left: "50%",
          bgcolor: lineColor
        }}
      />
    </Box>
  );
};

export default CrossDeco;