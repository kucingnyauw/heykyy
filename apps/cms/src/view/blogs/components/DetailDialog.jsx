import React, { useCallback } from "react";
import { Box, Typography, Paper, Chip, alpha, Divider, useTheme } from "@mui/material";
import { AppDialog, AppFlexLayout, AppGridLayout, IconButton } from "@heykyy/components";
import { FileText, Eye, ThumbsUp, Hash, Link as LinkIcon, Tag, Calendar, Clock, Copy } from "lucide-react";

/**
 * DetailDialog Component to display detailed information of a blog.
 * * @param {Object} props - Component props
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object|null} props.selectedBlog - The blog data to display
 * @param {boolean} props.isMobile - Mobile screen breakpoint flag
 * @returns {JSX.Element|null} The DetailDialog component
 */
const DetailDialog = ({ open, onClose, selectedBlog, isMobile }) => {
  const theme = useTheme();

  /**
   * Reusable local component for displaying label-value information rows.
   */
  const InfoRow = useCallback(
    ({ icon: Icon, label, value, monospace = false }) => (
      <AppFlexLayout gap={2} sx={{ py: 1 }} align={monospace ? "center" : "flex-start"}>
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

  if (!selectedBlog) return null;

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
            <FileText size={28} />
          </Paper>
          <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
            {selectedBlog.title}
          </Typography>
          <AppFlexLayout gap={1}>
            <Chip
              label={selectedBlog.status}
              size="small"
              color={selectedBlog.status === "PUBLISHED" ? "success" : "default"}
              sx={{ fontWeight: 600 }}
            />
            <Chip label={selectedBlog.categoryName} size="small" variant="outlined" />
          </AppFlexLayout>
        </AppFlexLayout>
        <Box sx={{ px: 3, pb: 2 }}>
          <AppGridLayout columns="repeat(2, 1fr)" gap={2} sx={{ mb: 3 }}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
              <Eye size={20} color={theme.palette.text.secondary} />
              <Typography variant="h6" fontWeight="bold">{selectedBlog.viewCount}</Typography>
              <Typography variant="caption" color="text.secondary">Views</Typography>
            </Paper>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
              <ThumbsUp size={20} color={theme.palette.text.secondary} />
              <Typography variant="h6" fontWeight="bold">{selectedBlog.likeCount}</Typography>
              <Typography variant="caption" color="text.secondary">Likes</Typography>
            </Paper>
          </AppGridLayout>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Summary
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
            <Typography variant="body2" color="text.secondary">
              {selectedBlog.summary || "No summary available."}
            </Typography>
          </Paper>
          <Divider sx={{ mb: 2, borderStyle: "dashed" }} />
          <AppFlexLayout direction="column" gap={0.5} align="stretch">
            <InfoRow icon={Hash} label="Blog ID" value={selectedBlog.id} monospace />
            <InfoRow icon={LinkIcon} label="Slug" value={selectedBlog.slug} monospace />
            <AppFlexLayout gap={2} sx={{ py: 1 }}>
              <Box sx={{ color: theme.palette.text.secondary }}><Tag size={18} /></Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                  Tags
                </Typography>
                <AppFlexLayout gap={1} wrap="wrap">
                  {selectedBlog.tags.length > 0 ? (
                    selectedBlog.tags.map((t, i) => (
                      <Chip
                        key={i}
                        label={t}
                        size="small"
                        variant="outlined"
                        sx={{
                          height: 26,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: theme.palette.text.primary,
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                      />
                    ))
                  ) : (
                    <Typography variant="caption" color="text.secondary">-</Typography>
                  )}
                </AppFlexLayout>
              </Box>
            </AppFlexLayout>
            <AppGridLayout columns={isMobile ? "1fr" : "repeat(2, 1fr)"} sx={{ mt: 1 }}>
              <InfoRow icon={Calendar} label="Created At" value={selectedBlog.createdAtFormatted} />
              <InfoRow icon={Clock} label="Last Updated" value={selectedBlog.updatedAtFormatted} />
            </AppGridLayout>
          </AppFlexLayout>
        </Box>
      </Box>
    </AppDialog>
  );
};

export default DetailDialog;