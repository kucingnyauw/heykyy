import { Card, CardContent, useTheme, alpha, Skeleton, Box } from "@mui/material";

/**
 * Komponen EducationSkeleton sebagai placeholder loading untuk EducationCard.
 * Memiliki layout identik dengan EducationCard dan dilengkapi animasi shimmer.
 */
const EducationSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const skeletonColor = alpha(theme.palette.text.primary, 0.08);

  return (
    <Card
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.background.default, 0.2),
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          transform: "translateX(-100%)",
          backgroundImage: `linear-gradient(90deg, transparent, ${
            isDark
              ? alpha(theme.palette.common.white, 0.08)
              : alpha(theme.palette.common.white, 0.6)
          }, transparent)`,
          animation: "shimmer 1.5s infinite cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
          pointerEvents: "none",
        },
        "@keyframes shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      }}
    >
      <CardContent 
        sx={{ 
          p: { xs: 2.5, sm: 3.5 }, 
          display: "flex", 
          flexDirection: "column", 
          gap: 2 
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {/* Title & Institution Skeleton */}
          <Box sx={{ mb: 0.5 }}>
            <Skeleton variant="text" width="90%" height={28} animation={false} sx={{ bgcolor: skeletonColor }} />
            <Skeleton variant="text" width="60%" height={28} animation={false} sx={{ bgcolor: skeletonColor }} />
          </Box>

          {/* Date / Calendar Skeleton (Mobile Only) */}
          <Box 
            sx={{ 
              display: { xs: "flex", sm: "none" }, 
              alignItems: "center", 
              gap: 1, 
              mt: 1.5 
            }}
          >
            <Skeleton variant="circular" width={14} height={14} animation={false} sx={{ bgcolor: skeletonColor }} />
            <Skeleton variant="text" width={100} height={20} animation={false} sx={{ bgcolor: skeletonColor }} />
          </Box>
        </Box>

        {/* Description Skeleton (3 baris) */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}>
          <Skeleton variant="text" width="100%" height={20} animation={false} sx={{ bgcolor: skeletonColor }} />
          <Skeleton variant="text" width="95%" height={20} animation={false} sx={{ bgcolor: skeletonColor }} />
          <Skeleton variant="text" width="80%" height={20} animation={false} sx={{ bgcolor: skeletonColor }} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default EducationSkeleton;