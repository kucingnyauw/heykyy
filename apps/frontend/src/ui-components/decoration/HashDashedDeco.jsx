import { Box, useTheme, alpha } from "@mui/material";

const HashDashedDeco = ({ sx }) => {
  const theme = useTheme();
  const color = alpha(theme.palette.text.secondary, 0.3);

  return (
    <Box
      sx={{
        position: "absolute",
        width: 250,
        height: 250,
        zIndex: -2,
        pointerEvents: "none",
        maskImage: "radial-gradient(circle, black 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 80%)",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "1px",
          height: "100%",
          left: "40%",
          borderLeft: `1px dashed ${color}`
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "1px",
          height: "100%",
          left: "60%",
          borderLeft: `1px dashed ${color}`
        }}
      />
      <Box
        sx={{
          position: "absolute",
          height: "1px",
          width: "100%",
          top: "40%",
          borderTop: `1px dashed ${color}`
        }}
      />
      <Box
        sx={{
          position: "absolute",
          height: "1px",
          width: "100%",
          top: "60%",
          borderTop: `1px dashed ${color}`
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "10px",
          height: "1px",
          top: "50%",
          left: "calc(50% - 5px)",
          bgcolor: color
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "1px",
          height: "10px",
          left: "50%",
          top: "calc(50% - 5px)",
          bgcolor: color
        }}
      />
    </Box>
  );
};

export default HashDashedDeco;