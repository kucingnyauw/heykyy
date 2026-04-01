// theme-config.js
import { createTheme, alpha } from "@mui/material";
import {
  DarkPalette,
  LightPalette,
  Size,
  FontFamily,
  Transition,
} from "@heykyy/theme";

/**
 * Mendapatkan theme MUI untuk CMS
 * @param {"light"|"dark"} mode
 * @returns {Theme}
 */
export const getTheme = (mode = "dark") => {
  // Pilih palette sesuai mode dan gunakan source 'cms'
  const P = mode === "dark" ? DarkPalette.cms : LightPalette.cms;

  const fg = P.foreground;
  const bg = P.background;
  const card = P.card;
  const border = P.border;
  const muted = P.muted;

  const primaryMain = P.primary;
  const primaryText = P.primaryForeground;

  const BORDER = "0.5px";

  return createTheme({
    zIndex: {
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
      backdrop: 1290,
      overlay: 1350,
      max: 9999,
    },
    palette: {
      mode,
      common: { black: "#0e0e0e", white: "#ffffff" },
      primary: { main: primaryMain, contrastText: primaryText },
      secondary: { main: P.secondary, contrastText: P.secondaryForeground },
      background: { default: bg, paper: card },
      text: { primary: fg, secondary: P.mutedForeground, disabled: muted },
      divider: border,
      error: {
        main: "#e53935",
        light: "#ef5350",
        dark: "#c62828",
        contrastText: "#ffffff",
      },
      custom: {
        gradient: {
          title: `linear-gradient(180deg, ${fg} 0%, ${P.mutedForeground} 100%)`,
          subtitle: `linear-gradient(180deg, ${P.mutedForeground} 0%, ${alpha(
            P.mutedForeground,
            0.65
          )} 100%)`,
        },
        surface: { muted, card, popover: P.popover },
        border: { default: border, subtle: alpha(border, 0.6) },
      },
    },
    typography: {
      fontFamily: FontFamily.primary,
      fontSize: 14,
      h1: { fontSize: Size.font["4xl"], fontWeight: 600 },
      h2: { fontSize: Size.font["3xl"], fontWeight: 600 },
      h3: { fontSize: Size.font["2xl"], fontWeight: 600 },
      h4: { fontSize: Size.font.xl, fontWeight: 600 },
      h5: { fontSize: Size.font.lg, fontWeight: 600 },
      h6: { fontSize: Size.font.base, fontWeight: 600 },
      body1: { fontSize: Size.font.sm, lineHeight: 1.6 },
      body2: { fontSize: Size.font.xs, lineHeight: 1.6 },
      button: {
        textTransform: "none",
        fontSize: Size.font.xs,
        fontWeight: 450,
        lineHeight: 1.4,
        letterSpacing: "0.01em",
      },
    },
    shape: { borderRadius: "12px" },
    transitions: {
      duration: {
        shortest: 100,
        shorter: 150,
        short: 200,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: Transition.easing.inOut,
        easeOut: Transition.easing.out,
        easeIn: Transition.easing.in,
        sharp: Transition.easing.inOut,
      },
      create: (props = ["all"], options = {}) => {
        const { duration = 200, easing = "ease", delay = 0 } = options;
        const propString = Array.isArray(props) ? props.join(", ") : props;
        return `${propString} ${duration}ms ${easing} ${delay}ms`;
      },
    },
    shadows: Size.shadow,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: card,
            color: fg,
            WebkitFontSmoothing: "antialiased",
          },
          "@font-face": [
            {
              fontFamily: "Anime Ace",
              src: "url('/animeace2_reg.ttf') format('truetype')",
              fontWeight: 400,
              fontStyle: "normal",
              fontDisplay: "swap",
            },
     
          ],
          "input:-webkit-autofill, .MuiOutlinedInput-input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 1000px ${P.muted} inset !important`,
            WebkitTextFillColor: `${fg} !important`,
            caretColor: fg,
            borderRadius: Size.radius.md,
            transition: "background-color 9999s ease-in-out 0s",
          },
          "& .MuiDialogContent-root": { p: 0, overflowX: "hidden" },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: bg,
            color: fg,
            borderBottom: `${BORDER} solid ${border}`,
          },
        },
      },

      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: card,
            borderRight: `${BORDER} solid ${border}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: card,
            boxShadow: "none",
            border: `${BORDER} solid ${border}`,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: Size.radius.md,
            paddingTop: Size.spacing[1.5],
            paddingBottom: Size.spacing[1.5],
            paddingLeft: Size.spacing[2],
            paddingRight: Size.spacing[2],
            transition: Transition.preset.fast,
            cursor: "default",
      
            "&.MuiListItem-gutters": {
              paddingLeft: Size.spacing[2],
              paddingRight: Size.spacing[2],
            },
      
            "&:hover": {
              backgroundColor: muted,
            },
      
            "&.clickable": {
              cursor: "pointer",
      
              "&:hover": {
                backgroundColor: muted,
                transform: "translateY(-1px)",
              },
      
              "&:active": {
                transform: "translateY(0px)",
              },
            },
          },
        },
      },
      
      MuiDialogContent: {
        styleOverrides: { root: { padding: 0, overflowX: "hidden" } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            position: "relative",
            overflow: "hidden",
            borderRadius: Size.radius.md,
            padding: `${Size.spacing[1.5]} ${Size.spacing[3]}`,
            minHeight: 32,
            fontSize: Size.font.xs,
            fontWeight: 450,
            letterSpacing: "0.01em",
            transition: Transition.preset.fast,
          },
          contained: {
            backgroundColor: primaryMain,
            color: primaryText,
            "&:hover": { opacity: 0.95 },
          },
          outlined: {
            border: `${BORDER} solid ${border}`,
            color: fg,
            "&:hover": { backgroundColor: muted },
          },
          text: {
            color: fg,
            fontWeight: 400,
            "&:hover": { backgroundColor: muted },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: card,
            border: `${BORDER} solid ${border}`,
            boxShadow: "none",
            borderRadius: Size.radius.lg,
            transition: Transition.preset.fast,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            backgroundColor: P.muted,
            borderRadius: "12px",
            fontSize: Size.font.sm,
            transition: Transition.preset.fast,
            "& fieldset": { borderColor: border, borderWidth: "0.1px" },
            "&:hover fieldset": { borderColor: border, borderWidth: "0.1px" },
            "&.Mui-focused fieldset": {
              borderColor: border,
              borderWidth: "0.1px",
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: P.mutedForeground,
            fontSize: Size.font.sm,
            transition: Transition.preset.fast,
            "&.Mui-focused": { color: fg },
          },
        },
      },
      MuiDivider: {
        styleOverrides: { root: { borderColor: border, borderWidth: 0.5 } },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: Size.radius.sm,
            "&:hover": { backgroundColor: muted },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: muted,
            color: fg,
            borderRadius: Size.radius.full,
            border: `${BORDER} solid ${border}`,
            fontSize: Size.font.xs,
            height: 24,
            transition: Transition.preset.fast,
          },
        },
      },
      MuiCheckbox: {
        styleOverrides: {
          root: {
            color: P.mutedForeground,
            padding: Size.spacing[1],
            "&.Mui-checked": { color: primaryMain },
          },
        },
      },
      MuiRadio: {
        styleOverrides: {
          root: {
            color: P.mutedForeground,
            padding: Size.spacing[1],
            "&.Mui-checked": { color: primaryMain },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          track: { backgroundColor: muted, opacity: 1 },
          thumb: { backgroundColor: primaryMain },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: Size.radius.sm,
            "&:hover": { backgroundColor: muted },
          },
        },
      },
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            backgroundColor: card,
            color: fg,
            border: `${BORDER} solid ${border}`,
          },
        },
      },
    },
  });
};
