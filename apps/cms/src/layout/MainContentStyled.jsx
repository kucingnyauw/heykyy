import { styled } from "@mui/material/styles";
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "@heykyy/constant";

const TOP_SPACING = 9.5;

/**
 * A styled `<main>` component serving as the primary content wrapper for the dashboard layout.
 * It dynamically adjusts its width and left margin based on the sidebar's toggle state,
 * providing smooth CSS transitions and responsive scaling for mobile and tablet screens.
 *
 * @param {Object} props - The component props passed by MUI styled system.
 * @param {boolean} props.open - Indicates whether the sidebar is expanded (true) or collapsed (false).
 */
const MainContentStyled = styled("main", {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => {
  const gap = theme.spacing(1.25);
  const mobileGap = theme.spacing(2.5);
  const smallGap = theme.spacing(0.5);

  const sidebarWidth = open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  return {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: `calc(100vh - ${theme.spacing(TOP_SPACING)})`,
    marginTop: theme.spacing(TOP_SPACING),
    padding: theme.spacing(3),
    marginLeft: `calc(${sidebarWidth}px + ${gap})`,
    marginRight: gap,
    width: `calc(100% - ${sidebarWidth}px - (${gap} * 2))`,
    backgroundColor: theme.palette.background.default,
    borderRadius: "16px",
    transition: theme.transitions.create(["margin", "width"], {
      easing: open
        ? theme.transitions.easing.easeOut
        : theme.transitions.easing.sharp,
      duration: open
        ? theme.transitions.duration.enteringScreen
        : theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.down("md")]: {
      marginLeft: mobileGap,
      marginRight: mobileGap,
      width: `calc(100% - (${mobileGap} * 2))`,
    },
    [theme.breakpoints.down("sm")]: {
      marginLeft: smallGap,
      marginRight: smallGap,
      width: `calc(100% - (${smallGap} * 2))`,
      padding: theme.spacing(2),
    },
  };
});

export default MainContentStyled;