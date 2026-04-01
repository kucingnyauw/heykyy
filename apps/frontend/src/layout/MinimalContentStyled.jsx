import { styled, alpha } from "@mui/material/styles";

/**
 * A styled `<main>` component serving as the primary content wrapper.
 * Provides a full-height layout with a visual 'glow' effect using
 * radial gradients on pseudo-elements (::before and ::after).
 *
 * @param {Object} props - The component properties.
 * @param {Object} props.theme - The MUI theme object for accessing palette and spacing.
 * @returns {Object} The responsive CSS styling object supporting dark and light modes.
 */
const MainContentStyled = styled("main")(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  const blur = 120;
  const glowColorPrimary = alpha(theme.palette.primary.main, isDark ? 0.08 : 0.03);
  const glowColorSecondary = alpha(theme.palette.secondary.main, isDark ? 0.08 : 0.03);

  const glowBaseStyles = {
    content: '""',
    position: "absolute",
    width: "40vw",
    height: "40vw",
    minWidth: "400px",
    minHeight: "400px",
    filter: `blur(${blur}px)`,
    zIndex: -1,
    pointerEvents: "none",
    transition: "background 0.5s ease-in-out",
  };

  return {
    position: "relative",
    isolation: "isolate",
    backgroundColor: theme.palette.background.default,
    transition: "background-color 0.5s ease-in-out",
    minHeight: "100vh",
    flexGrow: 1,
    width: "100%",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: theme.spacing(6, 4),
    paddingBottom: theme.spacing(8),
    overflow: "hidden",

    "&::before": {
      ...glowBaseStyles,
      top: "-10%",
      left: "-10%",
      background: `radial-gradient(circle, ${glowColorPrimary} 0%, transparent 70%)`,
    },

    "&::after": {
      ...glowBaseStyles,
      bottom: "-10%",
      right: "-10%",
      background: `radial-gradient(circle, ${glowColorSecondary} 0%, transparent 70%)`,
    },

    "& > *": {
      position: "relative",
      zIndex: 1,
    },

    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(6, 4),
    },

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(6, 2),
    },
  };
});

export default MainContentStyled;