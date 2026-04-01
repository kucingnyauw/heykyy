import React, { memo } from "react";
import { Box, Skeleton, useTheme, useMediaQuery, Divider } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";

/**
 * Skeleton loader component for the Project Details page.
 * Mimics the exact layout structure and spacing of the main ProjectDetails component.
 */
const ProjectDetailsSkeleton = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const radius = theme.shape.borderRadius;

  return (
    <AppFlexLayout
      direction="column"
      align="flex-start"
      gap={5}
      sx={{ width: "100%" }}
    >
      {/* Header Section */}
      <AppFlexLayout
        direction="column"
        align="flex-start"
        gap={3}
        sx={{ width: "100%" }}
      >
        {/* Category, Title & Summary */}
        <AppFlexLayout direction="column" align="flex-start" gap={2} sx={{ width: "100%" }}>
      
            <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: radius }} />
       

          <AppFlexLayout direction="column" align="flex-start" gap={1.5} sx={{ width: "100%" }}>
            <Box sx={{ width: "100%" }}>
              <Skeleton variant="text" width="90%" sx={{ fontSize: { xs: "2.25rem", md: "3rem" } }} />
              <Skeleton variant="text" width="60%" sx={{ fontSize: { xs: "2.25rem", md: "3rem" } }} />
            </Box>
            <Box sx={{ width: "100%" }}>
              <Skeleton variant="text" width="100%" height={24} />
              <Skeleton variant="text" width="85%" height={24} />
            </Box>
          </AppFlexLayout>
        </AppFlexLayout>

        {/* Author & Actions Bar */}
        <AppFlexLayout
          direction={isMobile ? "column" : "row"}
          align={isMobile ? "flex-start" : "center"}
          justify="space-between"
          gap={3}
          sx={{
            width: "100%",
            py: { xs: 2, md: 3 },
            borderTop: `1px dashed ${theme.palette.divider}`,
            borderBottom: `1px dashed ${theme.palette.divider}`,
          }}
        >
          {/* Profile Info */}
          <AppFlexLayout direction="row" align="center" gap={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <AppFlexLayout direction="column" align="flex-start" gap={0.5}>
              <Skeleton variant="text" width={120} height={20} />
              <Skeleton variant="text" width={180} height={16} />
            </AppFlexLayout>
          </AppFlexLayout>

          {/* Action Buttons */}
          <AppFlexLayout
            direction="row"
            align="center"
            justify={isMobile ? "space-between" : "flex-end"}
            gap={2}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            {/* Likes & Audio */}
            <AppFlexLayout direction="row" align="center" gap={2}>
              <AppFlexLayout direction="row" align="center" gap={1}>
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="text" width={20} height={20} />
              </AppFlexLayout>
              <Divider orientation="vertical" flexItem sx={{ height: 20, alignSelf: "center" }} />
              <Skeleton variant="circular" width={36} height={36} />
            </AppFlexLayout>

            {/* Links & Share */}
            <AppFlexLayout direction="row" align="center" gap={1}>
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
              <Skeleton variant="circular" width={36} height={36} />
            </AppFlexLayout>
          </AppFlexLayout>
        </AppFlexLayout>
      </AppFlexLayout>

      {/* Carousel / Images */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={isMobile ? 250 : 450}
        sx={{ borderRadius: radius }}
      />

      {/* Tech Stack Chips */}
      <AppFlexLayout direction="row" wrap="wrap" gap={1.5} sx={{ width: "100%" }}>
        {Array.from({ length: 5 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            width={80 + Math.random() * 40}
            height={32}
            sx={{ borderRadius: radius }}
          />
        ))}
      </AppFlexLayout>

      {/* HTML Content Body */}
      <AppFlexLayout direction="column" align="flex-start" gap={2} sx={{ width: "100%" }}>
        <Box sx={{ width: "100%" }}>
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="95%" height={24} />
          <Skeleton variant="text" width="80%" height={24} />
        </Box>
        <Box sx={{ width: "100%", mt: 2 }}>
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: radius }} />
        </Box>
      </AppFlexLayout>

      {/* Support Card Footer */}
      <Skeleton
        variant="rectangular"
        width="100%"
        height={isMobile ? 180 : 100}
        sx={{ borderRadius: radius }}
      />
    </AppFlexLayout>
  );
});

export default ProjectDetailsSkeleton;