import { Box } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";

const BoxDeco = ({ sx }) => {
  const theme = useTheme();

  const boxStyle = {
    width: 80,
    height: 80,
    border: `0.5px solid ${alpha(theme.palette.divider, 0.5)}`,
    background: `linear-gradient(180deg, ${alpha(
      theme.palette.text.disabled,
      0.8
    )} 0%, ${alpha(theme.palette.background.default, 0.2)} 100%)`,
    zIndex: -2,
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: { xs: 20, md: 0 },
        left: 0,
        width: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        pointerEvents: "none",
        ...sx,
      }}
    >
      {/* LEFT */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <Box sx={boxStyle} />
        <Box sx={{ ...boxStyle, ml: 10.25 }} />
      </Box>

      {/* RIGHT */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        <Box sx={boxStyle} />
        <Box sx={{ ...boxStyle, mr: 10.25 }} />
      </Box>
    </Box>
  );
};

export default BoxDeco;

