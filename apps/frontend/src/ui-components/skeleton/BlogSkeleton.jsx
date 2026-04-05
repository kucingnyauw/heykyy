import {
  Box,
  Card,
  CardContent,
  useTheme,
  alpha,
  Divider,
  Skeleton,
  Typography,
  Stack,
} from "@mui/material";

/**
 * Komponen BlogSkeleton sebagai placeholder loading untuk BlogCard.
 * Memiliki layout yang identik 1:1 dengan BlogCard.
 */
const BlogSkeleton = () => {
  const theme = useTheme();
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
        animation="wave"
        sx={{ bgcolor: skeletonColor }}
      />

      <Skeleton
        variant="rounded"
        width={48}
        height={24}
        animation="wave"
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
        {/* TITLE */}
        <Typography variant="h6" sx={{ mb: 1 }}>
          <Skeleton
            variant="rounded"
            width="95%"
            height="1.365rem"
            animation="wave"
            sx={{ bgcolor: skeletonColor, mb: 0.8 }}
          />
          <Skeleton
            variant="rounded"
            width="70%"
            height="1.365rem"
            animation="wave"
            sx={{ bgcolor: skeletonColor }}
          />
        </Typography>

        {/* SUMMARY */}
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          <Skeleton
            variant="rounded"
            width="100%"
            height="1.25rem"
            animation="wave"
            sx={{ bgcolor: skeletonColor, mb: 0.8 }}
          />
          <Skeleton
            variant="rounded"
            width="85%"
            height="1.25rem"
            animation="wave"
            sx={{ bgcolor: skeletonColor }}
          />
        </Typography>

        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />

        {/* FOOTER */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mt: "auto" }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Skeleton
              variant="circular"
              width={28}
              height={28}
              animation="wave"
              sx={{ bgcolor: skeletonColor }}
            />
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center">
            <Skeleton
              variant="circular"
              width={14}
              height={14}
              animation="wave"
              sx={{ bgcolor: skeletonColor }}
            />
            <Skeleton
              variant="rounded"
              width={60}
              height={16}
              animation="wave"
              sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default BlogSkeleton;