/**
 * @fileoverview Component to display comprehensive project details,
 * including auto-scrolling audio playback, like interaction system,
 * and related project recommendations.
 */

import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";

import {
  Box,
  Divider,
  Typography,
  useTheme,
  alpha,
  useMediaQuery,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Share,
  ExternalLink,
  PlayCircle,
  PauseCircle,
  ThumbsUp,
  Calendar,
  Clock,
  ArrowRight,
  Github,
  Hash,
} from "lucide-react";

import {
  getProject,
  getRandomProject,
  likeProject,
} from "../../service/project-service";
import { selectIsAuthenticated } from "../../store/auth/auth-selectors";
import { DateUtils, NumberUtils } from "@heykyy/utils-frontend";
import {
  AppProfileAvatar,
  AppCarousel,
  IconButton,
  AppFlexLayout,
  AppGridLayout,
  AppProjectCard,
  TextButton,
  OutlinedButton,
  AppPopper,
  AppBasicCard,
  FilledButton,
} from "@heykyy/components";

import { ROLE } from "@heykyy/constant";
import HtmlContent from "../../ui-components/HtmlContent";
import ShareDialog from "../../ui-components/ShareDialog";
import ProjectDetailsSkeleton from "./components/ProjectDetailSkeleton";
import ProjectEmptyState from "./components/ProjectEmptyState";

/**
 * Animated Thumb Icon Component.
 * @param {Object} props - Component properties.
 * @param {boolean} props.liked - Status indicating if the project is liked.
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
 * Main Project Details Page.
 * Fetches data based on the slug parameter in the URL, renders content,
 * and handles audio playback, auto-scrolling, and interactions.
 * @returns {JSX.Element} Project details page.
 */
const ProjectDetails = () => {
  const theme = useTheme();
  const radius = theme.shape.borderRadius;
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { slug } = useParams();
  const queryClient = useQueryClient();

  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isLikeThrottled, setIsLikeThrottled] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const htmlRef = useRef(null);
  const audioPlayer = useRef(new Audio());
  const scrollRafRef = useRef(null);

  const {
    data: project,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["project-details", slug],
    queryFn: () => getProject(slug),
    enabled: !!slug,
    staleTime: 300000,
    retry: 1,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["project-recommendations", slug],
    queryFn: () => getRandomProject(slug),
    enabled: !!slug,
    staleTime: 300000,
  });

  const { mutate: triggerLikeMutation, isPending } = useMutation({
    mutationFn: () => likeProject(project?.id),
    onMutate: async () => {
      await queryClient.cancelQueries(["project-details", slug]);
      const previousProject = queryClient.getQueryData([
        "project-details",
        slug,
      ]);

      queryClient.setQueryData(["project-details", slug], (old) => ({
        ...old,
        stats: {
          ...old.stats,
          hasLiked: !old.stats.hasLiked,
          likes: old.stats.hasLiked ? old.stats.likes - 1 : old.stats.likes + 1,
        },
      }));
      return { previousProject };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ["project-details", slug],
        context.previousProject
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(["project-details", slug]);
    },
  });

  useEffect(() => {
    const audio = audioPlayer.current;
    if (project?.audio?.url) audio.src = project.audio.url;

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
  }, [project?.audio?.url]);

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

  /**
   * Handles the toggle functionality for audio playback.
   */
  const handleToggleAudio = useCallback(() => {
    if (!project?.audio?.url) return;
    if (isPlaying) {
      audioPlayer.current.pause();
      setIsPlaying(false);
      setIsAutoScrolling(false);
    } else {
      audioPlayer.current.play();
      setIsPlaying(true);
      setIsAutoScrolling(true);
    }
  }, [isPlaying, project?.audio?.url]);

  /**
   * Handles the like button click with throttling to prevent spam requests.
   */
  const handleLikeClick = useCallback(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (isPending || isLikeThrottled) return;

    triggerLikeMutation();
    setIsLikeThrottled(true);

    setTimeout(() => {
      setIsLikeThrottled(false);
    }, 1500);
  }, [
    isAuthenticated,
    isPending,
    isLikeThrottled,
    navigate,
    triggerLikeMutation,
  ]);

  /**
   * Handles avatar click event to open the author popper.
   * @param {React.MouseEvent} event - The mouse click event.
   */
  const handleAvatarClick = (event) => setAnchorEl(event.currentTarget);

  /**
   * Closes the author detail popper.
   */
  const handlePopperClose = () => setAnchorEl(null);

  if (isLoading) return <ProjectDetailsSkeleton />;

  if (isError || !project) {
    return <ProjectEmptyState />;
  }

  const metaTitle =
    project?.metadata?.title || project?.title || "Project Details";
  const metaDescription =
    project?.metadata?.description || project?.summary || "";

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        {metaDescription && (
          <meta name="description" content={metaDescription} />
        )}
      </Helmet>

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
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="overline"
                fontWeight={800}
                color="primary"
                sx={{ letterSpacing: 1.2 }}
              >
                {project.category?.name}
              </Typography>
            </Box>

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
              {project.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: "1.15rem",
                lineHeight: 1.7,
                fontStyle: "italic",
              }}
            >
              {project.summary}
            </Typography>
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
                profileUrl={project.author?.avatar}
                displayName={project.author?.name}
                onClick={handleAvatarClick}
                sx={{ cursor: "pointer" }}
              />
              <AppFlexLayout direction="column" align="flex-start" gap={0.5}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: "text.primary" }}
                >
                  {project.author?.name}
                </Typography>
                <AppFlexLayout
                  direction="row"
                  align="center"
                  gap={1}
                  sx={{ color: "text.secondary" }}
                >
                  <Calendar size={12} />
                  <Typography variant="caption">
                    {DateUtils.formatDate(project.timestamps?.createdAt)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.5 }}>
                    •
                  </Typography>
                  <Clock size={12} />
                  <Typography variant="caption">
                    {project.stats?.readTime || 0} min read
                  </Typography>
                </AppFlexLayout>
              </AppFlexLayout>

              <AppPopper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handlePopperClose}
                placement="bottom-start"
                sx={{ p: 2.5, minWidth: 260, borderRadius: radius }}
              >
                <AppFlexLayout direction="column" align="flex-start" gap={1.5}>
                  <AppFlexLayout direction="row" align="center" gap={1.5}>
                    <AppProfileAvatar
                      size="sm"
                      profileUrl={project.author?.avatar}
                      displayName={project.author?.name}
                    />
                    <AppFlexLayout direction="row" align="center" gap={1}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {project.author?.name}
                      </Typography>
                      {project.author?.role && (
                        <Chip
                          label={
                            ROLE[project.author.role.toUpperCase()] || ROLE.USER
                          }
                          size="extraSmall"
                          sx={{
                            height: 20,
                            fontSize: "0.65rem",
                            borderRadius: radius,
                          }}
                        />
                      )}
                    </AppFlexLayout>
                  </AppFlexLayout>
                  {project.author?.bio && (
                    <Typography variant="body2" color="text.secondary">
                      {project.author.bio}
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
                    title="Like Project"
                    onClick={handleLikeClick}
                    disabled={isPending || isLikeThrottled}
                    sx={{
                      borderRadius: "50%",
                      color: project.stats?.hasLiked
                        ? "primary.main"
                        : "text.secondary",
                      bgcolor: project.stats?.hasLiked
                        ? alpha(theme.palette.primary.main, 0.1)
                        : "transparent",
                    }}
                    icon={
                      <AnimatedThumb
                        liked={project.stats?.hasLiked}
                        size={18}
                      />
                    }
                  />
                  <Typography variant="body2" fontWeight={700}>
                    {project.stats?.likes}
                  </Typography>
                </AppFlexLayout>

                {project.audio?.url && (
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
                {project.links?.repository && (
                  <IconButton
                    size="extraSmall"
                    title="Repository"
                    sx={{ borderRadius: "50%" }}
                    onClick={() =>
                      window.open(project.links.repository, "_blank")
                    }
                    icon={<Github size={18} />}
                  />
                )}
                {project.links?.demo && (
                  <IconButton
                    size="extraSmall"
                    title="Demo"
                    sx={{ borderRadius: "50%", color: "primary.main" }}
                    onClick={() => window.open(project.links.demo, "_blank")}
                    icon={<ExternalLink size={18} />}
                  />
                )}
              </AppFlexLayout>
            </AppFlexLayout>
          </AppFlexLayout>
        </AppFlexLayout>

        <AppCarousel
          sx={{ borderRadius: radius, width: "100%" }}
          images={project.thumbnails?.map((t) => t.url)}
        />

        <AppFlexLayout
          direction="row"
          wrap="wrap"
          gap={1.5}
          sx={{ width: "100%" }}
        >
          {project.stacks?.map((item) => (
            <Chip
              key={item.id}
              label={item.name}
              size="extraSmall"
              variant="outlined"
              icon={<Hash size={12} />}
              avatar={
                item.icon ? (
                  <Avatar
                    src={item.icon}
                    alt={item.name}
                    sx={{ width: 16, height: 16, bgcolor: "transparent" }}
                  />
                ) : null
              }
              onClick={() => item.url && window.open(item.url, "_blank")}
              sx={{
                cursor: item.url ? "pointer" : "default",
                borderRadius: radius,
              }}
            />
          ))}
        </AppFlexLayout>

        <Box ref={htmlRef} sx={{ width: "100%" }}>
          <HtmlContent html={project.content} />
        </Box>

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
                Enjoyed this project?
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
                disabled={isPending || isLikeThrottled}
                startIcon={
                  <AnimatedThumb liked={project.stats?.hasLiked} size={16} />
                }
                sx={{ px: 3, borderRadius: radius }}
              >
                {project.stats?.likes} Likes
              </OutlinedButton>
              <FilledButton
                size="extraSmall"
                onClick={() => setOpenShareDialog(true)}
                startIcon={<Share size={16} />}
                sx={{ px: 3, borderRadius: radius }}
              >
                Share
              </FilledButton>
            </AppFlexLayout>
          </AppFlexLayout>
        </AppBasicCard>

        <Divider sx={{ width: "100%", borderStyle: "dashed" }} />

        {recommendations?.length > 0 && (
          <AppFlexLayout direction="column" gap={4} sx={{ width: "100%" }}>
            <AppFlexLayout
              direction="row"
              justify="space-between"
              align="center"
              sx={{ width: "100%" }}
            >
              <AppFlexLayout direction="column" align="flex-start" gap={0.5}>
                <Typography variant="h5" fontWeight={700}>
                  Keep Exploring
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Handpicked projects you might enjoy
                </Typography>
              </AppFlexLayout>
              <TextButton
                size="extraSmall"
                endIcon={<ArrowRight size={18} />}
                onClick={() => navigate("/project")}
                sx={{ borderRadius: theme.shape.borderRadius }}
              >
                Explore All
              </TextButton>
            </AppFlexLayout>

            <AppGridLayout
              columns={{ xs: "1fr", sm: "repeat(2, 1fr)" }}
              gap={3}
            >
              {recommendations.map((project) => (
                <AppProjectCard
                  key={project.id}
                  project={{
                    ...project,
                    createdAt: DateUtils.formatDate(project.createdAt),
                    stats: {
                      ...project?.stats,
                      views: NumberUtils.views(project?.stats?.views),
                    },
                  }}
                  onClick={() => navigate(`/project/${project.slug}`)}
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
        title={`Check out this project: ${project.title}`}
      />
    </>
  );
};

export default memo(ProjectDetails);
