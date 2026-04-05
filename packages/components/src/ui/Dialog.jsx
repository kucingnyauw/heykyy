import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  useTheme,
  CircularProgress,
  alpha,
} from "@mui/material";
import { FilledButton, OutlinedButton } from "./Button";

/**
 * A highly customizable modal dialog component based on MUI's Dialog.
 * Supports automated button generation for actions and custom content styling.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - If true, the dialog is open.
 * @param {Function} [props.onClose] - Callback fired when the component requests to be closed.
 * @param {React.ReactNode} [props.dialogTitle] - The title text or element displayed at the top of the dialog.
 * @param {React.ReactNode} [props.children] - The main content of the dialog.
 * @param {Array<Object>|React.ReactNode} [props.actions] - An array of action objects to generate buttons, or a custom React node.
 * @param {Object} [props.sx={}] - Additional MUI system styles for the Dialog root.
 * @param {Object} [props.contentSx={}] - Additional MUI system styles for the DialogContent area.
 */
export const AppDialog = ({
  open,
  onClose,
  dialogTitle,
  children,
  actions,
  sx = {},
  contentSx = {},
  ...props
}) => {
  const theme = useTheme();

  const dialogSx = {
    "& .MuiDialog-paper": {
      borderRadius: theme.shape.borderRadius,
      display: "flex",
      flexDirection: "column",
    },
    ...sx,
  };

  let renderedActions = null;

  if (actions) {
    if (!Array.isArray(actions)) {
      renderedActions = <Box>{actions}</Box>;
    } else {
      renderedActions = actions.map((action, index) => {
        const { label, onClick, variant, disabled, loading, color } = action;

        const buttonContent = loading ? (
          <CircularProgress size={20} color="inherit" thickness={5} />
        ) : (
          label
        );

        return (
          <Box key={index} sx={{ ml: 1.5 }}>
            {variant === "outlined" ? (
              <OutlinedButton
                size="extraSmall"
                onClick={onClick}
                disabled={disabled || loading}
                color={color}
              >
                {buttonContent}
              </OutlinedButton>
            ) : (
              <FilledButton
                size="extraSmall"
                onClick={onClick}
                disabled={disabled || loading}
                color={color}
              >
                {buttonContent}
              </FilledButton>
            )}
          </Box>
        );
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      sx={dialogSx}
      {...props}
    >
      {dialogTitle && (
        <DialogTitle
          sx={{
            fontWeight: 700,
            fontSize: "1.1rem",
            px: 3,
            py: 2.5,
          }}
        >
          {dialogTitle}
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          {renderedActions}
        </DialogActions>
      )}
    </Dialog>
  );
};

AppDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  dialogTitle: PropTypes.node,
  children: PropTypes.node,
  actions: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.node.isRequired,
        onClick: PropTypes.func,
        variant: PropTypes.oneOf(["filled", "outlined"]),
        disabled: PropTypes.bool,
        loading: PropTypes.bool,
        color: PropTypes.string,
      })
    ),
    PropTypes.node,
  ]),
  sx: PropTypes.object,
  contentSx: PropTypes.object,
};