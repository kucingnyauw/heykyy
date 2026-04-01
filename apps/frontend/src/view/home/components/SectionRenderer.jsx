/**
 * @fileoverview The primary engine for dynamically rendering specific sections
 * of the Homepage based on a provided unique key.
 */

import React, { useMemo, memo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Masonry from "@mui/lab/Masonry";
import { Box, Typography, useTheme, useMediaQuery, alpha } from "@mui/material";

import {
  AppSectionLayout,
  AppFlexLayout,
  AppGridLayout,
  AppServiceCard,
  AppReviewCard,
  AppProjectCard,
  AppBlogCard,
  FilledButton,
  OutlinedButton,
  AppBasicCard,
  AppSnackBar,
} from "@heykyy/components";

import { getBlogsFeatures } from "../../../service/blogs-service";
import { getProjectsFeatures } from "../../../service/project-service";
import { getCvs } from "../../../service/cv-service";

import INFO from "../../../data/info";
import HomeData from "../../../data/home";
import TechMock from "../../../mock/tech-mock";
import ServiceMock from "../../../mock/services-mock";
import ReviewMock from "../../../mock/review-mock";
import OfferingMock from "../../../mock/offering-mock";

import { ProjectCardSkeleton, BlogCardSkeleton } from "./HomeSkeletons";
import {
  fadeInVariant,
  smoothRunning,
  SectionHeader,
  SectionTag,
  BoxedDeco,
  HashDashedDeco,
  DotGridDeco,
  CrossDeco,
} from "./HomeShared";

import GridPlusDeco from "../../../ui-components/GridPlusDeco";
import HashGlowDeco from "../../../ui-components/HashGlowDeco";

import StackIcon from "tech-stack-icons";
import { DateUtils, NumberUtils } from "@heykyy/utils-frontend";

/**
 * A highly decoupled renderer component that outputs a specific section of the homepage.
 * Uses conditional logic based on the `sectionKey` prop to selectively fetch data and render UI.
 * By keeping `enabled` flags on queries, it ensures APIs are only called when their matching section renders.
 *
 * @param {object} props - Component properties.
 * @param {string} props.sectionKey - A unique string identifier defining which layout to mount (e.g., 'hero', 'tech').
 * @returns {JSX.Element|null} The requested section layout or null if the key is invalid.
 */
const SectionRenderer = memo(({ sectionKey }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmUp = useMediaQuery(theme.breakpoints.up("sm"));
  const navigate = useNavigate();

  /**
   * Local state to manage the visibility and content of the global feedback snackbar.
   */
  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    message: "",
    variant: "info",
  });

  const { data: blogsData, isLoading: isBlogLoading } = useQuery({
    queryKey: ["blogs-features"],
    queryFn: getBlogsFeatures,
    staleTime: 300000,
    enabled: sectionKey === "blogs",
  });

  const { data: projectsData, isLoading: isProjectLoading } = useQuery({
    queryKey: ["projects-features"],
    queryFn: getProjectsFeatures,
    staleTime: 300000,
    enabled: sectionKey === "projects",
  });

  const { data: cvsData, isLoading: isCvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: getCvs,
    staleTime: 300000,
    enabled: sectionKey === "hero",
  });

  const config = useMemo(() => HomeData[sectionKey], [sectionKey]);

  /**
   * Generates a pre-filled WhatsApp link for direct contact.
   * Cleans the stored phone number and URL-encodes the message string.
   * @param {string} [customMessage] - An optional specific message to override the default.
   * @returns {string} A valid WhatsApp API URI.
   */
  const getWaLink = useCallback((customMessage) => {
    const cleanNumber = INFO.main.phone.replace(/[^0-9]/g, "");
    const defaultMessage =
      "Hi Rifky, I visited your portfolio and I'm interested in discussing a potential project/collaboration with you. Let's get in touch!";
    const text = encodeURIComponent(customMessage || defaultMessage);
    return `https://wa.me/${cleanNumber}?text=${text}`;
  }, []);

  /**
   * Handles the "View Resume" action from the Hero section.
   * Checks if data is loaded, validates the existence of the CV, and opens it in a new tab.
   * Triggers the snackbar if loading or if the CV is unavailable.
   */
  const handleViewResume = useCallback(() => {
    if (isCvsLoading) {
      setSnackbarInfo({
        open: true,
        message: "Please wait, preparing your resume...",
        variant: "info",
      });
      return;
    }

    const data = cvsData?.data || cvsData;
    const cv = Array.isArray(data)
      ? data.find((c) => c.isMain) || data[0]
      : data;
    const url = cv?.file?.url;

    if (url) {
      window.open(url, "_blank");
    } else {
      setSnackbarInfo({
        open: true,
        message: "CV not found. Please check back later.",
        variant: "error",
      });
    }
  }, [cvsData, isCvsLoading]);

  /** Closes the feedback snackbar */
  const handleCloseSnackbar = useCallback(() => {
    setSnackbarInfo((prev) => ({ ...prev, open: false }));
  }, []);

  // ===================== HERO SECTION =====================
  if (sectionKey === "hero") {
    const flexDirection = isSmUp ? "row" : "column";

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout sx={{ textAlign: "center" }}>
          <AppFlexLayout
            direction="column"
            align="center"
            gap={{ xs: 3, md: 4 }}
          >
            <SectionTag label={config.label} icon={config.icon} />
            <Typography
              variant={isMobile ? "h3" : "h1"}
              sx={{
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: { xs: 960, md: 880 },
                background: `linear-gradient(135deg, ${
                  theme.palette.text.primary
                } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {config.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: { xs: 600, md: 720 },
              }}
            >
              {config.subTitle}
            </Typography>
            <AppFlexLayout
              direction={flexDirection}
              gap={{ xs: 2, sm: 4 }}
              align="center"
              justify="center"
              sx={{ mt: 3 }}
            >
              <FilledButton
                size="medium"
                sx={{ borderRadius: theme.shape.borderRadius, minWidth: 140 }}
                onClick={handleViewResume}
              >
                View Resume
              </FilledButton>
              <OutlinedButton
                size="medium"
                sx={{ borderRadius: theme.shape.borderRadius, minWidth: 140 }}
                onClick={() => window.open(getWaLink(), "_blank")}
              >
                Contact Me
              </OutlinedButton>
            </AppFlexLayout>
          </AppFlexLayout>
        </AppSectionLayout>

        {/* Note: The AppSnackBar must be available within your components library for this to render properly */}
        <AppSnackBar
          open={snackbarInfo.open}
          message={snackbarInfo.message}
          variant={snackbarInfo.variant}
          onClose={handleCloseSnackbar}
        />
      </motion.div>
    );
  }

  // ===================== TECH SECTION =====================
  if (sectionKey === "tech") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout paddingX={0} sx={{ position: "relative" }}>
          <AppFlexLayout direction="column" gap={{ xs: 8, md: 12 }}>
            <SectionHeader {...config} />
            <Box
              sx={{
                overflow: "hidden",
                width: "100%",
                position: "relative",
                maskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: { xs: 2, md: 4 },
                  width: "max-content",
                  animation: `${smoothRunning} 30s linear infinite`,
                  willChange: "transform",
                }}
              >
                {[...TechMock, ...TechMock].map((item, index) => (
                  <Box
                    key={`${item.name}-${index}`}
                    sx={{
                      width: { xs: 70, md: 80 },
                      height: { xs: 70, md: 80 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: { xs: 1, md: 1.5 },
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.1)",
                     
                      },
                    }}
                  >
                    <Box
         
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                     
                    
                  
                        filter:
                          theme.palette.mode === "dark"
                            ? "grayscale(1)"
                            : "none",
                        opacity: theme.palette.mode === "light" ? 1 : 0.6,
           
          
                      }}
                    >
                      <StackIcon
                        name={item.iconName}
                        style={{
                          width: "50%",
                          height: "50%",
                          color: theme.palette.text.primary,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </AppFlexLayout>
        </AppSectionLayout>
      </motion.div>
    );
  }

  // ===================== PROJECTS SECTION =====================
  if (sectionKey === "projects") {
    if (!isProjectLoading && (!projectsData || projectsData.length === 0))
      return null;

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout sx={{ position: "relative" }}>
          <BoxedDeco />
          <AppFlexLayout direction="column" gap={{ xs: 8, md: 12 }}>
            <SectionHeader {...config} />
            <AppGridLayout
              columns={{ xs: "1fr", sm: "1fr", md: "repeat(3,1fr)" }}
              gap={4}
            >
              {isProjectLoading
                ? [...Array(3)].map((_, i) => <ProjectCardSkeleton key={i} />)
                : projectsData.map((project) => (
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
                      onClick={(slug) => navigate(`/project/${slug}`)}
                    />
                  ))}
            </AppGridLayout>
          </AppFlexLayout>
        </AppSectionLayout>
      </motion.div>
    );
  }

  // ===================== BLOGS SECTION =====================
  if (sectionKey === "blogs") {
    if (!isBlogLoading && (!blogsData || blogsData.length === 0)) return null;

    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout sx={{ position: "relative" }}>
          <DotGridDeco sx={{ top: -20, left: "10%" }} />
          <AppFlexLayout direction="column" gap={{ xs: 4, md: 12 }}>
            <SectionHeader {...config} />
            <AppGridLayout
              columns={{ xs: "1fr", sm: "1fr", md: "repeat(3,1fr)" }}
              gap={4}
            >
              {isBlogLoading
                ? [...Array(3)].map((_, i) => <BlogCardSkeleton key={i} />)
                : blogsData.map((blog) => (
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
                      onRead={(slug) => navigate(`/blogs/${slug}`)}
                    />
                  ))}
            </AppGridLayout>
          </AppFlexLayout>
        </AppSectionLayout>
      </motion.div>
    );
  }

  // ===================== OFFERINGS SECTION =====================
  if (sectionKey === "offerings") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout sx={{ position: "relative" }}>
          <GridPlusDeco
            sx={{ top: "10%", left: "50%", transform: "translateX(-50%)" }}
          />
          <AppFlexLayout direction="column" gap={{ xs: 8, md: 12 }}>
            <SectionHeader {...config} />
            <AppGridLayout
              columns={{ xs: "1fr", sm: "1fr", md: "repeat(3,1fr)" }}
              gap={4}
            >
              {OfferingMock.map((item) => (
                <AppBasicCard
                  key={item.title}
                  icon={<item.icon size={24} />}
                  title={item.title}
                  subtitle={item.description}
                  sx={{
                    minHeight: 160,
                    textOverflow: "ellipsis",
                  }}
                />
              ))}
            </AppGridLayout>
          </AppFlexLayout>
        </AppSectionLayout>
      </motion.div>
    );
  }

  // ===================== SERVICES SECTION =====================
  if (sectionKey === "services") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout sx={{ position: "relative" }}>
          <CrossDeco sx={{ top: "5%", left: "10%", transform: "scale(1.5)" }} />
          <CrossDeco
            sx={{
              top: { md: "30%", xs: "10%" },
              right: "10%",
              transform: "scale(1.5)",
            }}
          />
          <AppFlexLayout direction="column" gap={{ xs: 8, md: 12 }}>
            <SectionHeader {...config} />
            <AppGridLayout
              columns={{ xs: "1fr", sm: "1fr", md: "repeat(3,1fr)" }}
              gap={4}
            >
              {ServiceMock.services.map((item) => (
                <AppServiceCard
                  key={item.title}
                  {...item}
                  onSelect={() => {
                    const customMessage = `Hi Rifky, I saw your portfolio and I'm very interested in your "${item.title}" service. Could we discuss this further?`;
                    window.open(getWaLink(customMessage), "_blank");
                  }}
                />
              ))}
            </AppGridLayout>
          </AppFlexLayout>
        </AppSectionLayout>
      </motion.div>
    );
  }

  // ===================== TESTIMONIALS SECTION =====================
  if (sectionKey === "testimonials") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout sx={{ position: "relative", overflow: "hidden" }}>
          <HashDashedDeco sx={{ top: 0, right: { xs: "-5%", md: 40 } }} />
          <AppFlexLayout direction="column" gap={{ xs: 8, md: 12 }}>
            <SectionHeader {...config} />
            <Box
              sx={{
                overflow: "hidden",
                width: "100%",
                position: "relative",
                maskImage:
                  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  width: "max-content",
                  animation: `${smoothRunning} 60s linear infinite`,
                  willChange: "transform",
                  py: 1,
                  "&:has(.masonry-item:hover)": {
                    animationPlayState: "paused",
                  },
                }}
              >
                {[1, 2].map((group) => (
                  <Box
                    key={group}
                    sx={{ width: { xs: 900, md: 1100 }, flexShrink: 0 }}
                  >
                    <Masonry
                      columns={3}
                      spacing={2}
                      sx={{
                        m: 0,
                        alignContent: "flex-start",
                        maxHeight: { xs: 400, md: 600 },
                        overflow: "hidden",
                      }}
                    >
                      {ReviewMock.map((item, index) => (
                        <Box
                          key={`${group}-${index}`}
                          className="masonry-item"
                          sx={{
                            display: "flex",
                            breakInside: "avoid",
                            transition: "transform 0.3s ease",
                            "&:hover": { transform: "scale(1.02)", zIndex: 10 },
                          }}
                        >
                          <AppReviewCard
                            {...item}
                            rating={item.star}
                            sx={{
                              width: "100%",
                              height: "auto",
                              cursor: "pointer",
                            }}
                          />
                        </Box>
                      ))}
                    </Masonry>
                  </Box>
                ))}
              </Box>
            </Box>
          </AppFlexLayout>
        </AppSectionLayout>
      </motion.div>
    );
  }

  // ===================== CTA SECTION =====================
  if (sectionKey === "cta") {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInVariant}
      >
        <AppSectionLayout sx={{ position: "relative" }}>
          <HashGlowDeco
            sx={{
              top: "20%",
              left: "50%",
              transform: "translateX(-50%) scale(1.5)",
            }}
          />
          <AppFlexLayout
            direction="column"
            align="center"
            gap={{ xs: 4, md: 12 }}
            sx={{ textAlign: "center" }}
          >
            <SectionHeader {...config} />
            {/* FIXED: Changed from size="md" to size="medium" */}
            <FilledButton
              size="medium"
              onClick={() => window.open(getWaLink(), "_blank")}
            >
              Get in Touch
            </FilledButton>
          </AppFlexLayout>
        </AppSectionLayout>
      </motion.div>
    );
  }

  return null;
});

export default SectionRenderer;
