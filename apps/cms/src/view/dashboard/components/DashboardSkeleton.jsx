import React, { memo } from "react";
import { Box, Card, Skeleton } from "@mui/material";
import { AppFlexLayout, AppGridLayout } from "@heykyy/components";

/**
 * Skeleton loader component for the Dashboard view.
 *
 * @returns {JSX.Element}
 */
const DashboardSkeleton = () => {
  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      <AppFlexLayout direction="column" gap={{ xs: 3, md: 4 }} align="stretch" sx={{ width: "100%" }}>
        <AppFlexLayout justify="space-between" align="flex-end" wrap="wrap" gap={2} sx={{ width: "100%" }}>
          <Box>
            <Skeleton width={180} height={36} sx={{ mb: 0.5 }} />
            <Skeleton width={260} height={18} />
          </Box>
          <Skeleton width={160} height={40} />
        </AppFlexLayout>

        <AppGridLayout columns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={3} sx={{ width: "100%" }}>
          {[...Array(4)].map((_, i) => (
            <Card key={i} sx={{ p: 3, height: 140, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Skeleton width={36} height={36} variant="circular" sx={{ mb: 2 }} />
              <Skeleton width="50%" height={28} sx={{ mb: 1 }} />
              <Skeleton width="30%" height={16} />
            </Card>
          ))}
        </AppGridLayout>

        <AppGridLayout columns={{ xs: "1fr", lg: "2fr 1fr" }} gap={3} sx={{ width: "100%" }}>
          {[...Array(2)].map((_, i) => (
            <Card key={i} sx={{ p: 3, minHeight: { xs: 320, md: 420 } }}>
              <Skeleton variant="rectangular" height="100%" />
            </Card>
          ))}
        </AppGridLayout>
      </AppFlexLayout>
    </Box>
  );
};

export default memo(DashboardSkeleton);