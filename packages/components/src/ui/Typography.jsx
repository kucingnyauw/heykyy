import { Typography, alpha, useMediaQuery, useTheme } from "@mui/material";
import PropTypes from "prop-types";

/**
 * @param {{
 *  text: string,
 *  sx?: import('@mui/system').SxProps
 * }} props
 */
export const AppTitle = ({ text, sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Typography
      variant={isMobile ? "h3" : "h2"}
      sx={{
        fontWeight: 400,
        lineHeight: 1.25,
        maxWidth: { xs: 340, sm : 520 , md: 720 },
        letterSpacing: "-0.02em",

        background: `linear-gradient(135deg, ${
          theme.palette.text.primary
        } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",

        ...sx,
      }}
    >
      {text}
    </Typography>
  );
};

AppTitle.propTypes = {
  text: PropTypes.string.isRequired,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};

export const AppSubtitle = ({ text, sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  return (
    <Typography
      variant={isMobile ? "body2" : "body1"}
      sx={{
        mt: 1,
        color: theme.palette.text.secondary,
        maxWidth: { xs: 340, sm : 520 , md: 820 },

        background: isDark ? theme.palette.custom.gradient.subtitle : null,
        WebkitBackgroundClip: isDark ? "text" : null,
        WebkitTextFillColor: isDark ? "transparent" : null,

        ...sx,
      }}
    >
      {text}
    </Typography>
  );
};

AppSubtitle.propTypes = {
  text: PropTypes.string.isRequired,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
};
