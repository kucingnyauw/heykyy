import {
  Box,
  Card,
  CardContent,
  useTheme,
  alpha,
  Divider,
  Skeleton,
  Stack,
} from "@mui/material";

/**
 * Komponen ProjectSkeleton sebagai placeholder loading untuk ProjectCard.
 */
const ProjectSkeleton = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const skeletonColor = alpha(theme.palette.text.primary, 0.08);

  const cardMediaSkeleton = (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/10",
        overflow: "hidden",
        borderBottom: `0.5px solid ${alpha(theme.palette.divider, 0.7)}`,
        flexShrink: 0,
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation={false}
        sx={{ bgcolor: skeletonColor }}
      />

      {/* Views Badge Skeleton */}
      <Skeleton
        variant="rounded"
        width={48}
        height={24}
        animation={false}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          borderRadius: theme.shape.borderRadius,
          bgcolor: skeletonColor,
        }}
      />
    </Box>
  );

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
      {cardMediaSkeleton}

      <CardContent
        sx={{
          p: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Title Skeleton */}
        <Box sx={{ mb: 1 }}>
          <Skeleton
            variant="text"
            width="90%"
            height={28}
            animation={false}
            sx={{ bgcolor: skeletonColor }}
          />
          <Skeleton
            variant="text"
            width="60%"
            height={28}
            animation={false}
            sx={{ bgcolor: skeletonColor }}
          />
        </Box>

        {/* Summary Skeleton */}
        <Box sx={{ mt: 0.5 }}>
          <Skeleton
            variant="text"
            width="100%"
            height={20}
            animation={false}
            sx={{ bgcolor: skeletonColor }}
          />
          <Skeleton
            variant="text"
            width="80%"
            height={20}
            animation={false}
            sx={{ bgcolor: skeletonColor }}
          />
        </Box>

        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: "auto" }}
        >
          {/* Stacks/Avatars Skeleton */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={-1.25} // menggantikan margin negative
          >
            {[1, 2, 3, 4].map((item) => (
              <Skeleton
                key={item}
                variant="circular"
                width={28}
                height={28}
                animation={false}
                sx={{
                  bgcolor: skeletonColor,
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            ))}
          </Stack>

          {/* Date Skeleton */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Skeleton
              variant="circular"
              width={14}
              height={14}
              animation={false}
              sx={{ bgcolor: skeletonColor }}
            />
            <Skeleton
              variant="text"
              width={60}
              height={20}
              animation={false}
              sx={{ bgcolor: skeletonColor }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ProjectSkeleton;