import React, { useMemo } from "react";
import { Box, Backdrop } from "@mui/material";
import { keyframes, useTheme } from "@mui/material/styles";

const scaleUp = keyframes`
  0% {
    transform: scaleY(1);
    opacity: 0.4;
  }
  20% {
    transform: scaleY(1.5);
    opacity: 1;
  }
  40% {
    transform: scaleY(1);
    opacity: 0.6;
  }
  100% {
    opacity: 0.4;
  }
`;

export const AppLoading = ({ open = true }) => {
  const theme = useTheme();


  const backdropSx = useMemo(
    () => ({
      zIndex: theme.zIndex.modal - 1,
      backgroundColor: theme.palette.background.default,
      backdropFilter: "blur(2px)",
    }),
    [theme] // lebih aman
  );

  const bars = useMemo(() => {
    const borderRadius = theme.shape.borderRadius;
    const color = theme.palette.text.primary;

    return [0, 1, 2].map((i) => (
      <Box
        key={i}
        sx={{
          width: 3,
          height: i === 1 ? 36 : 20,
          borderRadius,
          bgcolor: color,
          opacity: 0.5,
          animation: `${scaleUp} 1s linear infinite`,
          animationDelay: `${i * 0.25}s`,
        }}
      />
    ));
  }, [theme]);

  return (
    <Backdrop open={open} sx={backdropSx}>
      <Box sx={{ display: "flex", gap: "4px", alignItems: "center" }}>
        {bars}
      </Box>
    </Backdrop>
  );
};