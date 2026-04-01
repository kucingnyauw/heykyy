/**
 * @fileoverview Komponen loading skeleton untuk daftar proyek dan blog di Homepage.
 */

import React, { memo } from "react";
import { Box, Skeleton, Divider, useTheme } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";

/**
 * Komponen skeleton (loading state) yang disesuaikan persis dengan AppProjectCard.
 * @returns {JSX.Element}
 */
export const ProjectCardSkeleton = memo(() => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        minWidth: 340,
        minHeight: 240,

        flexDirection: "column",
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/10" }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
      </Box>
      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Skeleton
            variant="rounded"
            width={50}
            height={24}
            sx={{ borderRadius: 4 }}
          />
          <Skeleton
            variant="rounded"
            width={60}
            height={24}
            sx={{ borderRadius: 4 }}
          />
        </Box>
        <Skeleton variant="text" width="90%" height={28} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="80%" height={20} />
        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />
        <AppFlexLayout
          justify="space-between"
          align="center"
          sx={{ mt: "auto" }}
        >
          <Skeleton variant="text" width={80} height={20} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
          </Box>
        </AppFlexLayout>
      </Box>
    </Box>
  );
});

/**
 * Komponen skeleton (loading state) yang disesuaikan persis dengan AppBlogCard.
 * @returns {JSX.Element}
 */
export const BlogCardSkeleton = memo(() => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minWidth: 340,
        minHeight: 240,
        display: "flex",
        flexDirection: "column",
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/10" }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
          <Skeleton
            variant="rounded"
            width={40}
            height={24}
            sx={{ borderRadius: 1 }}
          />
        </Box>
      </Box>
      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Skeleton variant="text" width="95%" height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="85%" height={20} />
        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />
        <AppFlexLayout
          justify="space-between"
          align="center"
          sx={{ mt: "auto" }}
        >
          <AppFlexLayout gap={1} align="center">
            <Skeleton variant="circular" width={28} height={28} />
          </AppFlexLayout>
          <AppFlexLayout gap={0.5} align="center">
            <Skeleton variant="circular" width={14} height={14} />
            <Skeleton variant="text" width={70} height={20} />
          </AppFlexLayout>
        </AppFlexLayout>
      </Box>
    </Box>
  );
});
