import { Card, CardContent, useTheme, alpha, Skeleton, Box } from "@mui/material";

/**
 * Komponen CertificateSkeleton sebagai placeholder loading untuk CertificateCard.
 * Memiliki layout identik dengan CertificateCard dan dilengkapi animasi shimmer.
 */
const CertificateSkeleton = () => {
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
      <CardContent sx={{ p: 2.5, display: "flex", flexDirection: "column" }}>
        {/* Title Skeleton */}
        <Box sx={{ mb: 1 }}>
          <Skeleton 
            variant="text" 
            width="85%" 
            height={28} 
            animation={false} 
            sx={{ bgcolor: skeletonColor }} 
          />
        </Box>

        {/* Summary Skeleton */}
        <Skeleton 
          variant="text" 
          width="60%" 
          height={20} 
          animation={false} 
          sx={{ bgcolor: skeletonColor }} 
        />
      </CardContent>
    </Card>
  );
};

export default CertificateSkeleton;