import { Box, styled, alpha } from "@mui/material";

const TextEditorWrapper = styled(Box)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";
  const borderColor = theme.palette.divider;

  return {
    width: "100%", // Memastikan container utama 100%
    display: "block",

    "& .quill": {
      width: "100%",
      borderRadius: theme.shape.borderRadius,
      border: `1px solid ${borderColor}`,
      backgroundColor: theme.palette.background.paper,
      transition: theme.transitions.create(["border-color", "box-shadow"]),
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        borderColor: alpha(theme.palette.text.primary, 0.2),
      },
      "&:focus-within": {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
      },
    },

    "& .ql-toolbar": {
      width: "100%",
      border: "none",
      borderBottom: `1px solid ${borderColor}`,
      backgroundColor:       theme.palette.custom.surface.muted,
      padding: theme.spacing(1, 1.5),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(1.5, 2),
      },
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing(0.5),
      backdropFilter: "blur(8px)",
      zIndex: 2,
    },

    "& .ql-container": {
      width: "100%",
      border: "none",
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.body1.fontSize,
      color: theme.palette.text.primary,
      backgroundColor: isDark 
        ? alpha(theme.palette.background.default, 0.3) 
        : theme.palette.background.paper,

      "& .ql-editor": {
        // Padding responsif menggunakan spacing
        padding: theme.spacing(2),
        [theme.breakpoints.up("sm")]: {
          padding: theme.spacing(3),
        },
        lineHeight: 1.8,
        // Tinggi minimum responsif
        minHeight: "250px",
        [theme.breakpoints.up("sm")]: {
          minHeight: "350px",
        },
        [theme.breakpoints.up("md")]: {
          minHeight: "400px",
        },
        transition: theme.transitions.create(["padding"]),

        "&.ql-blank::before": {
          color: theme.palette.text.disabled,
          fontStyle: "normal",
          left: theme.spacing(2),
          [theme.breakpoints.up("sm")]: {
            left: theme.spacing(3),
          },
        },

        "& img": {
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
          borderRadius: theme.shape.borderRadius,
          maxWidth: "100%",
          height: "auto",
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
          boxShadow: isDark 
            ? "0 4px 20px rgba(0,0,0,0.4)" 
            : "0 4px 20px rgba(0,0,0,0.08)",
        },

        "& iframe": {
          display: "block",
          width: "100%",
          maxWidth: "100%",
          aspectRatio: "16/9",
          borderRadius: theme.shape.borderRadius,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
        },

        "& pre": {
          width: "100%",
          overflowX: "auto",
          borderRadius: theme.shape.borderRadius,
          padding: theme.spacing(2),
          backgroundColor: isDark ? "#1e1e1e" : "#f5f5f5",
        },

        "& blockquote": {
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          paddingLeft: theme.spacing(2),
          marginLeft: 0,
          marginRight: 0,
          color: theme.palette.text.secondary,
          fontStyle: "italic",
        },
      },
    },

    "& .ql-tooltip": {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${borderColor}`,
      borderRadius: theme.shape.borderRadius,
      boxShadow: theme.shadows[4],
      color: theme.palette.text.primary,
      padding: theme.spacing(1, 2),
      zIndex: 100,
      "& input": {
        borderRadius: `calc(${theme.shape.borderRadius} / 2)`,
        border: `1px solid ${borderColor}`,
        padding: theme.spacing(0.5, 1),
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      },
      "& .ql-action": {
        color: theme.palette.primary.main,
        fontWeight: 600,
      }
    }
  };
});

export default TextEditorWrapper;