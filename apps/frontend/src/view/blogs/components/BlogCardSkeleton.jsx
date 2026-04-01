/**
 * @fileoverview Komponen skeleton (loading state) yang disesuaikan dengan AppBlogCard.
 */

import React, { memo } from "react";
import { Box, Skeleton, Divider, useTheme } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";

const BlogCardSkeleton = memo(() => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: theme.shape.borderRadius,
        border: `1px solid ${theme.palette.divider}`,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* Thumbnail Area - Ratio 16/10 */}
      <Box sx={{ position: "relative", width: "100%", aspectRatio: "16/10" }}>
        <Skeleton variant="rectangular" width="100%" height="100%" />
        {/* Skeleton Views Badge */}
        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
          <Skeleton variant="rounded" width={40} height={24} sx={{ borderRadius: 1 }} />
        </Box>
      </Box>

      {/* Content Area */}
      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Title (2 lines max in real card, so 2 skeletons here) */}
        <Skeleton variant="text" width="95%" height={28} sx={{ mb: 0.5 }} />
        <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1.5 }} />

        {/* Summary (2 lines) */}
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="85%" height={20} />

        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />

        {/* Footer: Author & Date */}
        <AppFlexLayout justify="space-between" align="center" sx={{ mt: "auto" }}>
          {/* Author */}
          <AppFlexLayout gap={1} align="center">
            <Skeleton variant="circular" width={28} height={28} />
          </AppFlexLayout>

          {/* Date */}
          <AppFlexLayout gap={0.5} align="center">
            <Skeleton variant="circular" width={14} height={14} />
            <Skeleton variant="text" width={70} height={20} />
          </AppFlexLayout>
        </AppFlexLayout>
      </Box>
    </Box>
  );
});

export default BlogCardSkeleton;