import React, { useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  alpha,
  Divider,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  AppFlexLayout,
  AppGridLayout,
  AppDialog,
  IconButton,
} from "@heykyy/components";
import {
  FolderGit2,
  Eye,
  ThumbsUp,
  Hash,
  Calendar,
  Clock,
  Copy,
  Link as LinkIcon,
  Layers,
} from "lucide-react";

/**
 * Dialog component that displays in-depth details of a specific project.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Determines if the dialog is visible.
 * @param {Function} props.onClose - Callback triggered to close the dialog.
 * @param {Object|null} props.selectedProject - The project object to be displayed.
 * @param {boolean} props.isMobile - Indicates if the current view is on a mobile viewport.
 * @returns {JSX.Element|null} The DetailDialog component.
 */
const DetailDialog = ({ open, onClose, selectedProject, isMobile }) => {
  const theme = useTheme();

  /**
   * Reusable local component for displaying label-value pairs with an optional copy functionality.
   *
   * @param {Object} props - Local component props.
   * @param {React.ElementType} props.icon - Lucide icon component.
   * @param {string} props.label - The descriptive label.
   * @param {string|number} props.value - The value to display.
   * @param {boolean} [props.monospace=false] - Whether to use a monospace font for the value.
   * @returns {JSX.Element}
   */
  const InfoRow = useCallback(
    ({ icon: Icon, label, value, monospace = false }) => (
      <AppFlexLayout
        gap={2}
        sx={{ py: 1 }}
        align={monospace ? "center" : "flex-start"}
      >
        <Box sx={{ color: theme.palette.text.secondary }}>
          <Icon size={18} />
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography variant="caption" display="block" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={monospace ? 600 : 500}
            sx={monospace ? { fontFamily: "monospace", fontSize: "0.85rem" } : {}}
            noWrap
          >
            {value}
          </Typography>
        </Box>
        {monospace && value && (
          <IconButton
          size="medium"
            onClick={() => navigator.clipboard.writeText(value)}
            icon={<Copy size={14} />}
            sx={{ width: 28, height: 28, p: 0.5 }}
          />
        )}
      </AppFlexLayout>
    ),
    [theme]
  );

  if (!selectedProject) return null;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      actions={[
        {
          label: "Close",
          variant: "outlined",
          onClick: onClose,
        },
      ]}
    >
      <Box>
        <AppFlexLayout
          direction="column"
          align="center"
          sx={{
            background: `linear-gradient(180deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, ${theme.palette.background.paper} 100%)`,
            pt: 4,
            pb: 3,
            px: 3,
            textAlign: "center",
          }}
        >
          <Paper
            elevation={2}
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              color: theme.palette.primary.main,
            }}
          >
            <FolderGit2 size={28} />
          </Paper>
          <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
            {selectedProject.title}
          </Typography>
          <Chip
            label={selectedProject.categoryName}
            size="small"
            variant="outlined"
          />
        </AppFlexLayout>
        <Box sx={{ px: 3, pb: 2 }}>
          <AppGridLayout columns="repeat(2, 1fr)" gap={2} sx={{ mb: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Eye size={20} color={theme.palette.text.secondary} />
              <Typography variant="h6" fontWeight="bold">
                {selectedProject.viewCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Views
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                p: 1.5,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <ThumbsUp size={20} color={theme.palette.text.secondary} />
              <Typography variant="h6" fontWeight="bold">
                {selectedProject.likeCount}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Likes
              </Typography>
            </Paper>
          </AppGridLayout>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Summary
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.02),
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {selectedProject.summary || "No summary available."}
            </Typography>
          </Paper>
          <Divider sx={{ mb: 2, borderStyle: "dashed" }} />
          <AppFlexLayout direction="column" gap={0.5} align="stretch">
            <InfoRow
              icon={Hash}
              label="Project ID"
              value={selectedProject.id}
              monospace
            />
            <InfoRow
              icon={LinkIcon}
              label="Slug"
              value={selectedProject.slug}
              monospace
            />
            <AppFlexLayout gap={2} sx={{ py: 1 }}>
              <Box sx={{ color: theme.palette.text.secondary }}>
                <Layers size={18} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Tech Stacks
                </Typography>
                <AppFlexLayout gap={1} wrap="wrap">
                  {selectedProject.stacks.length > 0 ? (
                    selectedProject.stacks.map((stack, i) => (
                      <Chip
                        key={i}
                        avatar={
                          <Avatar
                            src={stack.icon}
                            sx={{
                              width: 18,
                              height: 18,
                              bgcolor: "transparent",
                            }}
                          />
                        }
                        label={stack.name}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 28,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      -
                    </Typography>
                  )}
                </AppFlexLayout>
              </Box>
            </AppFlexLayout>
            <AppGridLayout
              columns={isMobile ? "1fr" : "repeat(2, 1fr)"}
              sx={{ mt: 1 }}
            >
              <InfoRow
                icon={Calendar}
                label="Created At"
                value={selectedProject.createdAtFormatted}
              />
              <InfoRow
                icon={Clock}
                label="Last Updated"
                value={selectedProject.updatedAtFormatted}
              />
            </AppGridLayout>
          </AppFlexLayout>
        </Box>
      </Box>
    </AppDialog>
  );
};

export default DetailDialog;