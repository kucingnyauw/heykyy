import { useMemo } from "react";
import PropTypes from "prop-types";
import { Typography, useTheme, useMediaQuery, Box } from "@mui/material";

export const AppLogo = ({ size = "medium", onClick, sx, ...props }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const logoConfig = useMemo(() => {
    const isDark = theme.palette.mode === "dark";

    const color = isDark
      ? theme.palette.common.white
      : theme.palette.text.primary;

    // Base scaling using theme spacing (8px grid)
    const base = isMobile ? 2.5 : 3; // 20px / 24px

    const sizeMap = {
      small: {
        icon: theme.spacing(base * 0.8),
        font: theme.typography.body2.fontSize,
      },
      medium: {
        icon: theme.spacing(base),
        font: theme.typography.h6.fontSize,
      },
      large: {
        icon: theme.spacing(base * 1.4),
        font: theme.typography.h5.fontSize,
      },
      extraLarge: {
        icon: theme.spacing(base * 1.8),
        font: theme.typography.h4.fontSize,
      },
    };

    const selected = sizeMap[size] || sizeMap.medium;

    return {
      color,
      gap: theme.spacing(0.75),
      iconSize: selected.icon,
      fontSize: selected.font,
    };
  }, [theme, isMobile, size]);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: logoConfig.gap,
        cursor: onClick ? "pointer" : "default",
        userSelect: "none",
        transition: theme.transitions.create("opacity"),
        "&:hover": onClick ? { opacity: 0.8 } : {},
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          width: logoConfig.iconSize,
          height: logoConfig.iconSize,
          position: "relative",
          display: "flex",
        }}
      >
        {/* left bar */}
        <Box
          sx={{
            position: "absolute",
            left: "10%",
            top: "8%",
            bottom: "8%",
            width: "26%",
            bgcolor: logoConfig.color,
            borderRadius: "999px",
          }}
        />

        {/* right bottom */}
        <Box
          sx={{
            position: "absolute",
            right: "10%",
            bottom: "8%",
            height: "48%",
            width: "26%",
            bgcolor: logoConfig.color,
            borderRadius: "999px",
          }}
        />

        {/* accent dot */}
        <Box
          sx={{
            position: "absolute",
            right: "10%",
            top: "8%",
            height: "28%",
            width: "28%",
            bgcolor: theme.palette.primary.main,
            borderRadius: "50%",
            boxShadow: `0 0 ${theme.spacing(1.5)} ${theme.palette.primary.main}`,
          }}
        />
      </Box>

      <Typography
        component="div"
        sx={{
          fontWeight: 700,
          color: logoConfig.color,
          fontSize: logoConfig.fontSize,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          fontFamily: "'Anime Ace', sans-serif",
        }}
      >
        Heykyy
      </Typography>
    </Box>
  );
};

AppLogo.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large", "extraLarge"]),
  onClick: PropTypes.func,
  sx: PropTypes.object,
};