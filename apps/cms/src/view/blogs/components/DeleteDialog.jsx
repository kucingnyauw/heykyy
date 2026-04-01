import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { AppDialog } from "@heykyy/components";
import { AlertTriangle } from "lucide-react";

/**
 * DeleteDialog Component for confirming blog deletion.
 * * @param {Object} props - Component props
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object|null} props.selectedBlog - The blog selected for deletion
 * @param {Function} props.onConfirm - Function to trigger the deletion
 * @param {boolean} props.isLoading - Loading state during deletion
 * @returns {JSX.Element} The DeleteDialog component
 */
const DeleteDialog = ({ open, onClose, selectedBlog, onConfirm, isLoading }) => {
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
          Delete blog <b>{selectedBlog?.title}</b>?
        </Typography>
      </Box>
    </AppDialog>
  );
};

export default DeleteDialog;