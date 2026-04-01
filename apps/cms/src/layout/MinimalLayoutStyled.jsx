import { styled } from "@mui/material/styles";

/**
 * A styled `<main>` component serving as the root container for minimal layouts.
 * Provides a clean, centered, and distraction-free wrapper with basic constraints.
 */
const MinimalLayoutStyled = styled("main")(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
  position: "relative",
  padding: theme.spacing(2),
  
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

export default MinimalLayoutStyled;