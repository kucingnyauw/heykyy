import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  useTheme,
  alpha,
  Typography,
  Divider,
  Tooltip,
  Avatar,
  Stack,
} from "@mui/material";
import { Image as ImageIcon, Eye, Calendar } from "lucide-react";
import { DateUtils, NumberUtils } from "@heykyy/utils";

/**
 * Komponen BlogCard untuk menampilkan ringkasan sebuah artikel/blog.
 */
const BlogCard = ({ blog, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const cardMedia = (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/10",
        overflow: "hidden",
        borderBottom: `0.5px solid ${alpha(theme.palette.divider , 0.9)}`,
        flexShrink: 0,
        bgcolor: isDark ? theme.palette.background.paper : theme.palette.common.black,
      }}
    >
      {blog?.thumbnail ? (
        <Box
          component="img"
          src={blog.thumbnail}
          alt={blog?.title || "Blog Thumbnail"}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "filter 0.3s ease",
          }}
        />
      ) : (
        <Stack
          justifyContent="center"
          alignItems="center"
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: isDark
              ? alpha(theme.palette.background.paper, 0.7)
              : theme.palette.secondary.main
          }}
        >
          <ImageIcon size={32} color={theme.palette.primary.main} />
        </Stack>
      )}

      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          px: 1.5,
          py: 0.5,
          borderRadius: theme.shape.borderRadius,
          bgcolor: alpha(theme.palette.common.black, 0.6),
          backdropFilter: "blur(4px)",
          color: theme.palette.common.white,
        }}
      >
        <Eye size={12} strokeWidth={2.5} />
        <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
          {NumberUtils.views(blog?.stats?.views || 0)}
        </Typography>
      </Stack>
    </Box>
  );

  return (
    <Card
      onClick={() => onClick?.(blog?.slug)}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.background.default, 0.2),
        transition: theme.transitions.create(
          ["transform", "border-color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        ...(onClick && {
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: alpha(theme.palette.primary.main, 0.4),
            boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            "& img": { filter: "brightness(0.85)" },
          },
        }),
      }}
    >
      {cardMedia}

      <CardContent
        sx={{
          p: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          sx={{
            lineHeight: 1.3,
            fontSize: "1.05rem",
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog?.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog?.summary}
        </Typography>

        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: "auto" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title={blog?.author?.name || "Unknown"} arrow>
              <Avatar
                src={blog?.author?.avatar}
                alt={blog?.author?.name}
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: "0.75rem",
                  border: `2px solid ${theme.palette.background.paper}`,
                  bgcolor: theme.palette.action.hover,
                }}
              >
                {blog?.author?.name?.charAt(0)}
              </Avatar>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "text.secondary" }}>
            <Calendar size={14} />
            <Typography variant="caption" fontWeight={500}>
              {blog?.createdAt ? DateUtils.formatDateShort(blog.createdAt) : ""}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

BlogCard.propTypes = {
  blog: PropTypes.shape({
    slug: PropTypes.string,
    title: PropTypes.string,
    summary: PropTypes.string,
    thumbnail: PropTypes.string,
    createdAt: PropTypes.string,
    stats: PropTypes.shape({
      views: PropTypes.number,
    }),
    author: PropTypes.shape({
      name: PropTypes.string,
      avatar: PropTypes.string,
    }),
  }),
  onClick: PropTypes.func,
};

export default BlogCard;