import { styled } from "@mui/material/styles";

/**
 * A styled `<main>` component serving as the content wrapper for single articles or pages.
 * Optimizes line length, responsive padding, and structural spacing for maximum reading comfort.
 *
 * @param {Object} props - The component properties.
 * @param {Object} props.theme - The MUI theme object for accessing palette and spacing.
 * @returns {Object} The responsive CSS styling object.
 */
const SingleContentStyled = styled("main")(({ theme }) => ({
  flexGrow: 1,
  width: "100%",
  maxWidth: "min(100%, 768px)",
  margin: "0 auto",
  padding: theme.spacing(8, 4),
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  position: "relative",
  overflow: "visible",
  minHeight: "100vh",

  "& > *": {
    zIndex: 1,
  },

  [theme.breakpoints.down("md")]: {
    padding: theme.spacing(6, 4),
  },

  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(4),
    paddingBottom: theme.spacing(14),
  },
}));

export default SingleContentStyled;