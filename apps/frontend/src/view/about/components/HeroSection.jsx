/**
 * @fileoverview Hero section component for the About page.
 * Displays the user's primary greeting, introduction, social links, and a stylized avatar with floating statistics.
 */

import React, { memo, useCallback } from "react";
import { Box, Typography, alpha, useTheme, useMediaQuery } from "@mui/material";
import { motion } from "framer-motion";
import {
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Sparkle,
} from "lucide-react";
import {
  AppFlexLayout,
  AppGridLayout,
  AppSectionLayout,
  IconButton,
} from "@heykyy/components";

import INFO from "../../../data/info";
import AboutData from "../../../data/about";
import avatar from "../../../assets/avatar2.webp";
import { fadeInVariant } from "./AboutShared";

/**
 * Renders a floating statistics card that hovers around the main avatar.
 * Utilizes Framer Motion for a continuous, smooth vertical bouncing animation.
 * * @param {object} props - Component properties.
 * @param {string} props.title - The main statistic value (e.g., "1.5", "5+").
 * @param {string} props.subtitle - The label for the statistic (e.g., "Years Experience").
 * @param {string|number} [props.top] - CSS top positioning.
 * @param {string|number} [props.bottom] - CSS bottom positioning.
 * @param {string|number} [props.left] - CSS left positioning.
 * @param {string|number} [props.right] - CSS right positioning.
 * @param {number} props.delay - Animation delay in seconds to stagger multiple floating stats.
 * @param {number[]} props.yAnimate - Array of Y-axis values for the keyframe animation.
 * @returns {JSX.Element}
 */
const FloatingStat = memo(
  ({ title, subtitle, top, bottom, left, right, delay, yAnimate }) => {
    const theme = useTheme();

    // Ensure positions resolve to strings/numbers rather than responsive objects
    const topPos = typeof top === "object" ? top.md || top.xs : top;
    const bottomPos =
      typeof bottom === "object" ? bottom.md || bottom.xs : bottom;
    const leftPos = typeof left === "object" ? left.md || left.xs : left;
    const rightPos = typeof right === "object" ? right.md || right.xs : right;

    return (
      <Box
        component={motion.div}
        animate={{ y: yAnimate }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
        sx={{
          position: "absolute",
          top: topPos,
          bottom: bottomPos,
          left: leftPos,
          right: rightPos,
          zIndex: 2,
          p: { xs: "8px 14px", md: "12px 20px" },
          borderRadius: theme.shape.borderRadius,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: alpha(theme.palette.background.paper, 0.4),
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          boxShadow: theme.shadows[4],
        }}
      >
        <Typography
          variant="h5"
          fontWeight="800"
          sx={{
            background: `linear-gradient(135deg, ${
              theme.palette.text.primary
            } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ opacity: 0.8, color: "text.secondary", textAlign: "center" }}
        >
          {subtitle}
        </Typography>
      </Box>
    );
  }
);

/**
 * Main Hero Section component.
 * Features a responsive grid: on desktop, text is on the left and the avatar is on the right. 
 * On mobile, the flex order is reversed to show the avatar first, followed by centered text.
 * * @returns {JSX.Element} The rendered hero section.
 */
const HeroSection = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const config = AboutData.hero;

  const getSocialIcon = useCallback((key) => {
    const icons = {
      github: <Github size={20} />,
      linkedin: <Linkedin size={20} />,
      twitter: <Twitter size={20} />,
      instagram: <Instagram size={20} />,
      facebook: <Facebook size={20} />,
    };
    return icons[key] || <Sparkle size={20} />;
  }, []);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInVariant}
    >
      <AppSectionLayout sx={{ position: "relative" }}>
        <AppGridLayout
          align="center"
          gap={12}
          columns={{ xs: "1fr", md: "1.2fr 0.8fr" }}
        >
          {/* Text Content */}
          <AppFlexLayout
            direction="column"
            gap={5}
            align="flex-start"
            sx={{
              textAlign: { xs: "center", md: "left" },
              order: { xs: 2, md: 1 },
              zIndex: 2,
            }}
          >
            <Typography
              variant={isMobile ? "h3" : "h1"}
              sx={{
                fontWeight: 400,
                lineHeight: 1.3,
                background: `linear-gradient(135deg, ${
                  theme.palette.text.primary
                } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              {config.title}
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: "text.secondary", maxWidth: 600, lineHeight: 1.7 }}
            >
              {config.subTitle}
            </Typography>

            {/* Social Links */}
            <AppFlexLayout direction="row" gap={1.5} align="center">
              {Object.entries(INFO.socials).map(([platform, url]) => (
                <IconButton
                  size="medium"
                  key={platform}
                  icon={getSocialIcon(platform)}
                  onClick={() => window.open(url, "_blank")}
                  sx={{
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    bgcolor: alpha(theme.palette.background.default, 0.05),
                    transition: "all 0.3s ease",
                    borderRadius: theme.shape.borderRadius,
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      transform: "translateY(-3px)",
                    },
                  }}
                />
              ))}
            </AppFlexLayout>
          </AppFlexLayout>

          {/* Avatar Area */}
          <AppFlexLayout
            direction="column"
            align="center"
            sx={{
              order: { xs: 1, md: 2 },
              position: "relative",
              width: "100%",
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                maxWidth: { xs: 260, md: 360 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box
                component="img"
                src={avatar}
                alt="Hero Avatar"
                sx={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  position: "relative",
                  zIndex: 1,
                  objectFit: "cover",
                  borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                }}
              />
              <FloatingStat
                title="1.5"
                subtitle="Years Experience"
                top="15%"
                left="-25%"
                delay={0}
                yAnimate={[-10, 10, -10]}
              />
              <FloatingStat
                title="5+"
                subtitle="Projects Solved"
                bottom="15%"
                right="-25%"
                delay={1.5}
                yAnimate={[10, -10, 10]}
              />
            </Box>
          </AppFlexLayout>
        </AppGridLayout>
      </AppSectionLayout>
    </motion.div>
  );
});

export default memo(HeroSection);