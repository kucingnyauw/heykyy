import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { AppDialog } from "@heykyy/components";
import { AlertTriangle } from "lucide-react";

/**
 * Dialog component for confirming the deletion of a project.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Determines if the dialog is visible.
 * @param {Function} props.onClose - Callback triggered to close the dialog.
 * @param {Object|null} props.selectedProject - The project object targeted for deletion.
 * @param {Function} props.onConfirm - Callback triggered to execute the deletion.
 * @param {boolean} props.isLoading - Indicates if the deletion process is currently ongoing.
 * @returns {JSX.Element} The DeleteDialog component.
 */
const DeleteDialog = ({
  open,
  onClose,
  selectedProject,
  onConfirm,
  isLoading,
}) => {
  const theme = useTheme();

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      dialogTitle="Confirm Deletion"
      maxWidth="xs"
      actions={[
        {
          label: "Cancel",
          variant: "outlined",
          onClick: onClose,
        },
        {
          label: "Delete",
          variant: "filled",
          color: "error",
          onClick: onConfirm,
          loading: isLoading,
        },
      ]}
    >
      <Box sx={{ p: 1, textAlign: "center" }}>
        <Box sx={{ color: theme.palette.error.main, mb: 2 }}>
          <AlertTriangle size={48} />
        </Box>
        <Typography variant="body1">
          Delete project <b>{selectedProject?.title}</b>?
        </Typography>
      </Box>
    </AppDialog>
  );
};

export default DeleteDialog;