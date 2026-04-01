/**
 * @fileoverview Component to display comprehensive blog details,
 * including auto-scrolling audio playback, like interactions,
 * multi-level comment features, and related article recommendations.
 */

import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";

import {
  Box,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
  Divider,
  Chip,
} from "@mui/material";
import {
  SendHorizonal,
  Calendar,
  Clock,
  ThumbsUp,
  Share,
  PlayCircle,
  PauseCircle,
  Hash,
  ArrowRight,
  ShieldAlert,

} from "lucide-react";

import {
  getComments,
  createComments,
  updateComments,
  deleteComments,
} from "../../service/comments-service";
import {
  getBlogs,
  likeBlogs,
  getRandomBlogs,
} from "../../service/blogs-service";
import { selectIsAuthenticated } from "../../store/auth/auth-selectors";

import { DateUtils, NumberUtils } from "@heykyy/utils-frontend";
import {
  AppFlexLayout,
  AppPagination,
  AppProfileAvatar,
  AppInput,
  IconButton,
  OutlinedButton,
  FilledButton,
  AppBasicCard,
  AppBlogCard,
  AppGridLayout,
  TextButton,
  AppPopper,
  AppLoading,
} from "@heykyy/components";

import { ROLE } from "@heykyy/constant";

import HtmlContent from "../../ui-components/HtmlContent";
import ShareDialog from "../../ui-components/ShareDialog";

import BlogEmptyState from "./components/BlogEmptyState";
import BlogsDetailSkeleton from "./components/BlogDetailSkeleton";
import CommentSkeleton from "./components/CommentSkeleton";
import CommentItem from "./components/CommentItem";

/**
 * Animated Thumb Icon Component.
 * @param {Object} props - Component properties.
 * @param {boolean} props.liked - Status indicating if the blog is liked.
 * @param {number} [props.size=18] - Icon size.
 * @returns {JSX.Element} Animated thumb icon component.
 */
const AnimatedThumb = memo(({ liked, size = 18 }) => {
  const theme = useTheme();
  return (
    <motion.div
      animate={
        liked ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : { scale: 1 }
      }
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ThumbsUp
        size={size}
        fill={liked ? theme.palette.primary.main : "none"}
        color={liked ? theme.palette.primary.main : "currentColor"}
      />
    </motion.div>
  );
});

/**
 * Main Blog Details Page.
 * Fetches data based on the slug parameter in the URL, renders blog content,
 * and handles audio playback, auto-scrolling, commenting system, and interactions.
 * @returns {JSX.Element} Blog details page component.
 */
const BlogsDetails = () => {
  const theme = useTheme();
  const radius = theme.shape.borderRadius;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { slug } = useParams();

  const [pageVal, setPageVal] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isLikeThrottled, setIsLikeThrottled] = useState(false);

  const htmlRef = useRef(null);
  const audioPlayer = useRef(new Audio());
  const scrollRafRef = useRef(null);
  const limit = 5;

  const {
    data: blog,
    isLoading: blogsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["blogs-detail", slug],
    queryFn: () => getBlogs(slug),
    enabled: !!slug,
    staleTime: 300000,
    retry: 1,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["blog-recommendations", slug],
    queryFn: () => getRandomBlogs(slug),
    enabled: !!slug,
    staleTime: 300000,
  });

  const { data: commentsData, isLoading: commentLoading } = useQuery({
    queryKey: ["blogs-comments", slug, pageVal],
    queryFn: () => getComments(slug, pageVal, limit),
    enabled: !!slug,
    keepPreviousData: true,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { content: "" },
  });

  /**
   * Handles pagination changes for the comments section.
   * @param {React.ChangeEvent} _ - The event object (unused).
   * @param {number} value - The new page number.
   */
  const handlePageChange = useCallback((_, value) => {
    setPageVal(value);
    setTimeout(() => {
      const commentsSection = document.getElementById("comments-section");
      if (commentsSection) {
        const yOffset = -100;
        const y =
          commentsSection.getBoundingClientRect().top +
          window.pageYOffset +
          yOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 100);
  }, []);

  /**
   * Handles avatar click event to open the author popper.
   * @param {React.MouseEvent} e - The mouse click event.
   */
  const handleAvatarClick = useCallback(
    (e) => setAnchorEl(e.currentTarget),
    []
  );

  /**
   * Closes the author detail popper.
   */
  const handlePopperClose = useCallback(() => setAnchorEl(null), []);

  /**
   * Handles the toggle functionality for audio playback.
   */
  const handleToggleAudio = useCallback(() => {
    if (!blog?.audio?.url) return;
    if (isPlaying) {
      audioPlayer.current.pause();
      setIsPlaying(false);
      setIsAutoScrolling(false);
    } else {
      audioPlayer.current.play();
      setIsPlaying(true);
      setIsAutoScrolling(true);
    }
  }, [blog?.audio?.url, isPlaying]);

  const { mutate: triggerLikeMutation, isPending: isLikePending } = useMutation(
    {
      mutationFn: () => likeBlogs(blog?.id),
      onMutate: async () => {
        await queryClient.cancelQueries(["blogs-detail", slug]);
        const prev = queryClient.getQueryData(["blogs-detail", slug]);
        queryClient.setQueryData(["blogs-detail", slug], (old) => ({
          ...old,
          stats: {
            ...old.stats,
            hasLiked: !old.stats.hasLiked,
            likes: old.stats.hasLiked
              ? old.stats.likes - 1
              : old.stats.likes + 1,
          },
        }));
        return { prev };
      },
      onError: (_, __, ctx) =>
        queryClient.setQueryData(["blogs-detail", slug], ctx.prev),
      onSettled: () => queryClient.invalidateQueries(["blogs-detail", slug]),
    }
  );

  /**
   * Handles the like button click with throttling to prevent spam requests.
   */
  const handleLikeClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isLikePending || isLikeThrottled) return;

    triggerLikeMutation();
    setIsLikeThrottled(true);

    setTimeout(() => {
      setIsLikeThrottled(false);
    }, 1500);
  }, [
    isAuthenticated,
    isLikePending,
    isLikeThrottled,
    navigate,
    triggerLikeMutation,
  ]);

  const createMutation = useMutation({
    mutationFn: (payload) => createComments(payload, blog?.id),
    onSuccess: (newComment, variables) => {
      if (pageVal !== 1) setPageVal(1);

      queryClient.setQueryData(["blogs-comments", slug, 1], (old) => {
        if (!old) return old;
        if (!variables.parentId) {
          return {
            ...old,
            data: [newComment, ...(old.data || [])],
            metadata: {
              ...old.metadata,
              totalItems: (old.metadata?.totalItems || 0) + 1,
              totalPages: Math.ceil(
                ((old.metadata?.totalItems || 0) + 1) / limit
              ),
            },
          };
        } else {
          return {
            ...old,
            data: (old.data || []).map((comment) => {
              if (comment.id === variables.parentId) {
                return {
                  ...comment,
                  replies: [newComment, ...(comment.replies || [])],
                };
              }
              return comment;
            }),
          };
        }
      });

      queryClient.setQueryData(["blogs-detail", slug], (old) => {
        if (!old) return old;
        return {
          ...old,
          stats: {
            ...old.stats,
            comments: (old.stats?.comments || 0) + (variables.parentId ? 0 : 1),
          },
        };
      });

      reset({ content: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateComments(id, data),
    onSuccess: (_, variables) => {
      queryClient.setQueriesData(
        { queryKey: ["blogs-comments", slug] },
        (old) => {
          if (!old) return old;
          const updateInList = (list) =>
            (list || []).map((item) => {
              if (item.id === variables.id)
                return { ...item, content: variables.data.content };
              if (item.replies?.length > 0)
                return { ...item, replies: updateInList(item.replies) };
              return item;
            });

          return { ...old, data: updateInList(old.data) };
        }
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteComments(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueriesData(
        { queryKey: ["blogs-comments", slug] },
        (old) => {
          if (!old) return old;
          const removeFromList = (list) => {
            return (list || []).filter((item) => {
              if (item.id === deletedId) return false;
              if (item.replies?.length > 0)
                item.replies = removeFromList(item.replies);
              return true;
            });
          };

          const newData = { ...old, data: removeFromList(old.data) };
          if (newData.metadata) {
            newData.metadata.totalItems = Math.max(
              0,
              (newData.metadata.totalItems || 0) - 1
            );
            newData.metadata.totalPages = Math.ceil(
              (newData.metadata.totalItems || 0) / limit
            );
          }
          return newData;
        }
      );

      queryClient.setQueryData(["blogs-detail", slug], (old) => {
        if (!old) return old;
        return {
          ...old,
          stats: {
            ...old.stats,
            comments: Math.max(0, (old.stats?.comments || 0) - 1),
          },
        };
      });
    },
  });

  useEffect(() => {
    const audio = audioPlayer.current;
    if (blog?.audio?.url) audio.src = blog.audio.url;
    const handleEnded = () => {
      setIsPlaying(false);
      setIsAutoScrolling(false);
    };
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [blog?.audio?.url]);

  useEffect(() => {
    const handleUserInteraction = (e) => {
      if (
        e.type === "wheel" ||
        e.type === "touchmove" ||
        (e.type === "keydown" &&
          ["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(
            e.code
          ))
      ) {
        if (isAutoScrolling) setIsAutoScrolling(false);
      }
    };
    window.addEventListener("wheel", handleUserInteraction, { passive: true });
    window.addEventListener("touchmove", handleUserInteraction, {
      passive: true,
    });
    window.addEventListener("keydown", handleUserInteraction, {
      passive: true,
    });
    return () => {
      window.removeEventListener("wheel", handleUserInteraction);
      window.removeEventListener("touchmove", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, [isAutoScrolling]);

  useEffect(() => {
    if (!isPlaying || !isAutoScrolling || !htmlRef.current) {
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      return;
    }
    const smoothScroll = () => {
      const audio = audioPlayer.current;
      if (!audio.duration || !isAutoScrolling) return;
      const targetScroll =
        htmlRef.current.offsetTop -
        150 +
        htmlRef.current.offsetHeight * (audio.currentTime / audio.duration);
      window.scrollTo({ top: targetScroll, behavior: "auto" });
      scrollRafRef.current = requestAnimationFrame(smoothScroll);
    };
    scrollRafRef.current = requestAnimationFrame(smoothScroll);
    return () => cancelAnimationFrame(scrollRafRef.current);
  }, [isPlaying, isAutoScrolling]);

  if (blogsLoading) return <BlogsDetailSkeleton />;

  if (isError || !blog) {
    return <BlogEmptyState />;
  }

  const metaTitle = blog?.metadata?.title || blog?.title || "Blog Details";
  const metaDescription = blog?.metadata?.description || blog?.summary || "";
  const commentsCount = commentsData?.metadata?.totalItems || 0;
  const totalPages = commentsData?.metadata?.totalPages || 1;

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        {metaDescription && (
          <meta name="description" content={metaDescription} />
        )}
      </Helmet>

      {(createMutation.isPending ||
        updateMutation.isPending ||
        deleteMutation.isPending) && <AppLoading />}

      <AppFlexLayout
        direction="column"
        align="flex-start"
        gap={5}
        sx={{ width: "100%" }}
      >
        <AppFlexLayout
          direction="column"
          align="flex-start"
          gap={3}
          sx={{ width: "100%" }}
        >
          <AppFlexLayout direction="column" align="flex-start" gap={2}>
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: radius,
                background: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="overline"
                fontWeight={800}
                color="primary"
                sx={{ letterSpacing: 1.2 }}
              >
                {blog.category?.name}
              </Typography>
            </Box>

            <AppFlexLayout
              direction="column"
              align="flex-start"
              gap={1.5}
              sx={{ width: "100%" }}
            >
              <Typography
                variant="h1"
                sx={{
                  background: `linear-gradient(135deg, ${
                    theme.palette.text.primary
                  } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
                  WebkitBackgroundClip: "text",
                  lineHeight: 1.4,
                  WebkitTextFillColor: "transparent",
                  fontSize: { xs: "2.25rem", md: "3rem" },
                }}
              >
                {blog.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontSize: "1.15rem",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  width: "100%",
                }}
              >
                {blog.summary}
              </Typography>
            </AppFlexLayout>
          </AppFlexLayout>

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
            <AppFlexLayout direction="row" align="center" gap={2}>
              <AppProfileAvatar
                size="md"
                profileUrl={blog.author?.avatar}
                displayName={blog.author?.name}
                onClick={handleAvatarClick}
                sx={{ cursor: "pointer" }}
              />
              <AppFlexLayout direction="column" align="flex-start" gap={0.5}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "text.primary" }}
                >
                  {blog.author?.name}
                </Typography>
                <AppFlexLayout
                  direction="row"
                  align="center"
                  gap={1}
                  sx={{ color: "text.secondary" }}
                >
                  <Calendar size={12} />
                  <Typography variant="caption">
                    {DateUtils.formatDate(blog.timestamps?.createdAt)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>
                    •
                  </Typography>
                  <Clock size={12} />
                  <Typography variant="caption">
                    {blog.stats?.readTime || 0} min read
                  </Typography>
                </AppFlexLayout>
              </AppFlexLayout>

              <AppPopper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handlePopperClose}
                sx={{ p: 2.5, minWidth: 260 }}
              >
                <AppFlexLayout direction="column" align="flex-start" gap={1.5}>
                  <AppFlexLayout direction="row" align="center" gap={1.5}>
                    <AppProfileAvatar
                      size="sm"
                      profileUrl={blog.author?.avatar}
                      displayName={blog.author?.name}
                    />
                    <AppFlexLayout direction="row" align="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {blog.author?.name}
                      </Typography>
                      {blog.author?.role && (
                        <Chip
                          label={
                            ROLE[blog.author.role.toUpperCase()] || ROLE.USER
                          }
                          size="extraSmall"
                          sx={{ height: 20, fontSize: "0.65rem" }}
                        />
                      )}
                    </AppFlexLayout>
                  </AppFlexLayout>
                  {blog.author?.bio && (
                    <Typography variant="body2" color="text.secondary">
                      {blog.author.bio}
                    </Typography>
                  )}
                </AppFlexLayout>
              </AppPopper>
            </AppFlexLayout>

            <AppFlexLayout
              direction="row"
              align="center"
              justify={isMobile ? "space-between" : "flex-end"}
              gap={2}
              sx={{ width: isMobile ? "100%" : "auto" }}
            >
              <AppFlexLayout direction="row" align="center" gap={2}>
                <AppFlexLayout direction="row" align="center" gap={1}>
                  <IconButton
                  size="extraSmall"
                    title="Like Blog"
                    onClick={handleLikeClick}
                    disabled={isLikePending || isLikeThrottled}
                    sx={{
                      borderRadius: "50%",
                      color: blog.stats?.hasLiked
                        ? "primary.main"
                        : "text.secondary",
                      bgcolor: blog.stats?.hasLiked
                        ? alpha(theme.palette.primary.main, 0.1)
                        : "transparent",
                    }}
                    icon={
                      <AnimatedThumb liked={blog.stats?.hasLiked} size={18} />
                    }
                  />
                  <Typography variant="body2" fontWeight={700}>
                    {blog.stats?.likes}
                  </Typography>
                </AppFlexLayout>

                {blog.audio?.url && (
                  <>
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ height: 20, alignSelf: "center" }}
                    />
                    <IconButton
                    size="extraSmall"
                      title="Listen"
                      onClick={handleToggleAudio}
                      sx={{
                        borderRadius: "50%",
                        color: isPlaying ? "primary.main" : "text.secondary",
                      }}
                      icon={
                        isPlaying ? (
                          <PauseCircle size={18} />
                        ) : (
                          <PlayCircle size={18} />
                        )
                      }
                    />
                  </>
                )}
              </AppFlexLayout>

              <AppFlexLayout direction="row" align="center" gap={1}>
                <IconButton
                size="extraSmall"
                  title="Share"
                  sx={{ borderRadius: "50%" }}
                  onClick={() => setOpenShareDialog(true)}
                  icon={<Share size={18} />}
                />
              </AppFlexLayout>
            </AppFlexLayout>
          </AppFlexLayout>
        </AppFlexLayout>

        {blog.thumbnail?.url && (
          <Box
            sx={{
              width: "100%",
              height: isMobile ? 300 : 480,
              overflow: "hidden",
              borderRadius: radius,
            }}
          >
            <Box
              component="img"
              src={blog.thumbnail.url}
              alt="blog thumbnail"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </Box>
        )}

        <Box ref={htmlRef} sx={{ width: "100%" }}>
          <HtmlContent html={blog.content} />
        </Box>

        <AppFlexLayout
          direction="row"
          wrap="wrap"
          gap={1.5}
          sx={{ width: "100%" }}
        >
          {blog.tags?.map((tag, idx) => (
            <Chip
              key={idx}
              label={tag}
              size="small"
              variant="outlined"
              icon={<Hash size={12} />}
              sx={{
                color: "text.secondary",
                borderRadius: theme.shape.borderRadius,
                py: 2,
                px: 1,
                bgcolor: alpha(theme.palette.text.primary, 0.03),
                borderColor: theme.palette.divider,
              }}
            />
          ))}
        </AppFlexLayout>

        <AppBasicCard sx={{ width: "100%", borderRadius: radius }}>
          <AppFlexLayout
            direction="row"
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={3}
          >
            <AppFlexLayout
              direction="column"
              align="flex-start"
              gap={1}
              sx={{ flex: 1.5, minWidth: 260 }}
            >
              <Typography variant="h6" fontWeight={700}>
                Enjoyed this article?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Support the creator by leaving a like or sharing this work with
                your network.
              </Typography>
            </AppFlexLayout>
            <AppFlexLayout
              direction="row"
              align="center"
              justify={isMobile ? "flex-start" : "flex-end"}
              gap={2}
              sx={{ flex: 1 }}
            >
              <OutlinedButton
                size="extraSmall"
                onClick={handleLikeClick}
                disabled={isLikePending || isLikeThrottled}
                startIcon={
                  <AnimatedThumb liked={blog.stats?.hasLiked} size={16} />
                }
                sx={{ borderRadius: radius, px: 3 }}
              >
                {blog.stats?.likes} Likes
              </OutlinedButton>
              <FilledButton
                size="extraSmall"
                onClick={() => setOpenShareDialog(true)}
                startIcon={<Share size={16} />}
                sx={{ borderRadius: radius, px: 3 }}
              >
                Share
              </FilledButton>
            </AppFlexLayout>
          </AppFlexLayout>
        </AppBasicCard>

        <Divider sx={{ width: "100%", borderStyle: "dashed" }} />

        <AppFlexLayout
          id="comments-section"
          direction="column"
          gap={4}
          sx={{ width: "100%" }}
        >
          <AppFlexLayout
            direction="row"
            justify="space-between"
            align="center"
            sx={{ width: "100%" }}
          >
            <Typography variant="h5" fontWeight={700}>
              Comments ({commentsCount})
            </Typography>
            <IconButton
              size="extraSmall"
              title="View community guidelines"
              icon={<ShieldAlert size={16} />}
              onClick={() => navigate("/guidelines")}
            />
          </AppFlexLayout>

          <Controller
            name="content"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <AppInput
                {...field}
                minRows={5}
                error={!!errors.content}
                placeholder="Write a comment..."
                endAdornment={
                  <IconButton
                    onClick={handleSubmit((d) => {
                      createMutation.mutate({
                        content: d.content,
                        parentId: null,
                      });
                    })}
                    icon={<SendHorizonal size={20} />}
                    isLoading={createMutation.isPending}
                  />
                }
              />
            )}
          />

          <AnimatePresence mode="popLayout">
            {commentLoading && !commentsData ? (
              <Box sx={{ width: "100%" }}>
                {[...Array(3)].map((_, i) => (
                  <CommentSkeleton key={i} />
                ))}
              </Box>
            ) : commentsData?.data?.length > 0 ? (
              commentsData.data.map((comment, idx) => (
                <CommentItem
                  key={comment.id}
                  item={comment}
                  isLast={idx === commentsData.data.length - 1}
                  onEdit={(id, content, cb) => {
                    updateMutation.mutate(
                      { id, data: { content } },
                      { onSuccess: cb }
                    );
                  }}
                  onDelete={(id) => {
                    if (window.confirm("Delete comment?")) {
                      deleteMutation.mutate(id);
                    }
                  }}
                  onReply={(parentId, content, cb) => {
                    createMutation.mutate(
                      { content, parentId },
                      { onSuccess: cb }
                    );
                  }}
                  createMutation={createMutation}
                  updateMutation={updateMutation}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                sx={{ py: 6, width: "100%" }}
              >
                No comments yet. Be the first to share your thoughts!
              </Typography>
            )}
          </AnimatePresence>

          {totalPages > 1 && (
            <AppFlexLayout direction="row" justify="center" sx={{ mt: 2 }}>
              <AppPagination
                count={totalPages}
                page={pageVal}
                onChange={handlePageChange}
                size={isMobile ? "small" : "medium"}
              />
            </AppFlexLayout>
          )}
        </AppFlexLayout>

        {recommendations?.length > 0 && (
          <AppFlexLayout
            direction="column"
            gap={4}
            sx={{ width: "100%", pt: 2 }}
          >
            <Divider sx={{ width: "100%", borderStyle: "dashed" }} />
            <AppFlexLayout
              direction="row"
              justify="space-between"
              align="center"
              sx={{ width: "100%" }}
            >
              <AppFlexLayout direction="column" align="flex-start" gap={0.5}>
                <Typography variant="h5" fontWeight={700}>
                  Keep Reading
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Other articles you might find interesting
                </Typography>
              </AppFlexLayout>
              <TextButton
                size="xs"
                sx={{ borderRadius: "99px" }}
                endIcon={<ArrowRight size={18} />}
                onClick={() => navigate("/blog")}
              >
                View All
              </TextButton>
            </AppFlexLayout>
            <AppGridLayout
              columns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
              gap={3}
            >
              {recommendations.map((blog) => (
                <AppBlogCard
                  key={blog.id}
                  blog={{
                    ...blog,
                    createdAt: DateUtils.formatDate(blog.createdAt),
                    stats: {
                      ...blog?.stats,
                      views: NumberUtils.views(blog?.stats?.views),
                    },
                  }}
                  onRead={() => navigate(`/blog/${blog.slug}`)}
                />
              ))}
            </AppGridLayout>
          </AppFlexLayout>
        )}
      </AppFlexLayout>

      <ShareDialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
        url={window.location.href}
        title={`Check out this blog: ${blog.title}`}
      />
    </>
  );
};

export default memo(BlogsDetails);