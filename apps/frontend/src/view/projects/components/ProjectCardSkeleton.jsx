/**
 * Komponen skeleton (loading state) untuk mempresentasikan kartu proyek yang sedang dimuat.
 * * @returns {JSX.Element} Elemen skeleton kartu proyek
 */
import React, { memo } from "react";
import { Box, Skeleton, Divider, useTheme } from "@mui/material";

const ProjectCardSkeleton = memo(() => {
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
      <Skeleton variant="rectangular" width="100%" sx={{ height: 190 }} />
      <Box sx={{ p: 3, flexGrow: 1 }}>
        <Skeleton variant="rectangular" width={60} height={22} sx={{ mb: 1.5, borderRadius: theme.shape.borderRadius }} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1.5 }} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="100%" sx={{ mb: 2 }} />
        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", ml: 1 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton
                key={i}
                variant="circular"
                width={26}
                height={26}
                sx={{ border: `2px solid ${theme.palette.background.paper}`, ml: -1 }}
              />
            ))}
          </Box>
          <Skeleton variant="text" width={80} height={20} />
        </Box>
      </Box>
    </Box>
  );
});

export default ProjectCardSkeleton;