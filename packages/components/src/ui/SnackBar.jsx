import { useMemo } from "react";
import PropTypes from "prop-types";
import { Snackbar, Alert, useTheme, alpha } from "@mui/material";

/**
 * A reusable, customized Snackbar component that displays brief, temporary notifications.
 * Features custom glassmorphism styling and seamless integration with MUI's Alert.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Controls the visibility of the snackbar.
 * @param {React.ReactNode} props.message - The message or content to display inside the snackbar.
 * @param {('success'|'error'|'warning'|'info')} [props.variant="success"] - The severity level of the alert, dictating its color scheme.
 * @param {number} [props.autoHideDuration=3000] - The number of milliseconds to wait before automatically calling onClose.
 * @param {Function} [props.onClose] - Callback fired when the component requests to be closed.
 * @param {Object} [props.anchorOrigin={ vertical: "bottom", horizontal: "center" }] - The anchor position of the snackbar on the screen.
 * @param {('top'|'bottom')} props.anchorOrigin.vertical - The vertical alignment of the snackbar.
 * @param {('left'|'center'|'right')} props.anchorOrigin.horizontal - The horizontal alignment of the snackbar.
 */
export const AppSnackBar = ({
  open,
  message,
  variant = "success",
  autoHideDuration = 3000,
  onClose,
  anchorOrigin = { vertical: "bottom", horizontal: "center" },
}) => {
  const theme = useTheme();

  const palette = useMemo(() => {
    switch (variant) {
      case "success":
        return theme.palette.success;
      case "error":
        return theme.palette.error;
      case "warning":
        return theme.palette.warning;
      case "info":
      default:
        return theme.palette.info;
    }
  }, [variant, theme.palette]);

  const snackbarContent = useMemo(
    () => (
      <Alert
        onClose={onClose}
        severity={variant}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0.5,
          width: "fit-content",
          maxWidth: "calc(100vw - 64px)",
          px: 1.25,
          py: 0.75,
          borderRadius: theme.shape.borderRadius,
          border: "1px solid",
          borderColor: alpha(palette.main, 0.4),
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(palette.main, 0.18)
              : alpha(palette.main, 0.12),
          color: theme.palette.text.primary,
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 6px 18px rgba(0,0,0,0.4)"
              : "0 6px 18px rgba(0,0,0,0.15)",
          backdropFilter: "blur(6px)",
          "& .MuiAlert-icon": {
            color: palette.main,
            padding: 0,
            margin: 0,
            alignSelf: "center",
          },
          "& .MuiAlert-message": {
            padding: 0,
            margin: 0,
            flex: "0 1 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            fontSize: theme.typography.body2.fontSize,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
          },
          "& .MuiAlert-action": {
            margin: 0,
            padding: 0,
            alignSelf: "center",
          },
        }}
      >
        {message}
      </Alert>
    ),
    [onClose, variant, theme, palette, message]
  );

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      {snackbarContent}
    </Snackbar>
  );
};

AppSnackBar.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["success", "error", "warning", "info"]),
  autoHideDuration: PropTypes.number,
  onClose: PropTypes.func,
  anchorOrigin: PropTypes.shape({
    vertical: PropTypes.oneOf(["top", "bottom"]),
    horizontal: PropTypes.oneOf(["left", "center", "right"]),
  }),
};