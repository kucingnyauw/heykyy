import React, { useState, useEffect, useCallback } from "react";
import { Box, alpha, useTheme } from "@mui/material";
import { AppDialog, IconButton } from "@heykyy/components";
import { ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";

/**
 * Dialog component for previewing images with zoom capabilities.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Function to close the dialog
 * @param {string|null} props.preview - URL of the image to preview
 * @returns {JSX.Element|null}
 */
const ImagePreviewDialog = ({ open, onClose, preview }) => {
  const theme = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (open) {
      setZoomLevel(1);
    }
  }, [open]);

  /**
   * Adjusts the zoom level constraint based on interaction.
   *
   * @param {string} type - Zoom action type ('in', 'out', or 'reset')
   */
  const handleZoom = useCallback((type) => {
    setZoomLevel((prev) => {
      if (type === "in") return Math.min(prev + 0.5, 3);
      if (type === "out") return Math.max(prev - 0.5, 1);
      return 1;
    });
  }, []);

  if (!preview) return null;

  return (
    <AppDialog
      open={open}
      title="Media Preview"
      maxWidth="lg"
      onClose={onClose}
    >
      <Box
        sx={{
          position: "relative",
          bgcolor: "#0a0a0a",
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 10,
            display: "flex",
            gap: 1,
            bgcolor: alpha(theme.palette.background.default, 0.7),
            p: 1,
            borderRadius: theme.shape.borderRadius,
          }}
        >
          <IconButton
          size="medium"
            icon={<ZoomOut size={18} />}
            onClick={() => handleZoom("out")}
            disabled={zoomLevel <= 1}
          />
          <IconButton
          size="medium"
            icon={<ZoomIn size={18} />}
            onClick={() => handleZoom("in")}
            disabled={zoomLevel >= 3}
          />
          <IconButton
          size="medium"
            icon={<Maximize2 size={18} />}
            onClick={() => handleZoom("reset")}
          />
          <IconButton size="medium" icon={<X size={18} />} onClick={onClose} />
        </Box>
        <Box sx={{ transition: "0.3s", transform: `scale(${zoomLevel})` }}>
          <img
            src={preview}
            style={{
              maxWidth: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
            }}
            alt="Preview"
          />
        </Box>
      </Box>
    </AppDialog>
  );
};

export default ImagePreviewDialog;