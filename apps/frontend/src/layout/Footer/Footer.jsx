import React, { memo } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Link,
  useTheme,
  alpha,
  Divider,
  Stack,
} from "@mui/material";
import {
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  MapPin,
} from "lucide-react";

import {
  AppGridLayout,
  AppFlexLayout,
  AppLogo,
} from "@heykyy/components";

import { navbarMenu } from "../../menu-items";
import INFO from "../../data/info";

const Footer = () => {
  const theme = useTheme();

  const socialIcons = {
    github: <Github size={18} />,
    twitter: <Twitter size={18} />,
    linkedin: <Linkedin size={18} />,
    instagram: <Instagram size={18} />,
  };

  const columnBoxStyle = {
    p: { xs: 2.5, sm: 3 },
    height: "100%",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
    minHeight: 120,
  };

  const alignStart = "flex-start";

  return (
    <Box
      component="footer"
      sx={{
        p: { xs: 3, md: 6 },
        pb: { xs: 12, sm: 14, md: 6 },
        bgcolor: alpha(theme.palette.background.paper, 0.36),
      }}
    >
      <AppGridLayout
        columns={{ xs: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" }}
        gap={2}
      >
        {/* Brand */}
        <Box sx={columnBoxStyle}>
          <AppFlexLayout direction="column" gap={2} align={alignStart}>
            <AppLogo />
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ lineHeight: 1.7, maxWidth: 520, textAlign: "left" }}
            >
            Heykyy is my digital portfolio, showcasing projects and experiences. I create digital experiences with passion and precision, focusing on delivering impactful solutions through clean code and thoughtful design
            </Typography>
   
          </AppFlexLayout>
        </Box>

        {/* Sitemap */}
        <Box sx={columnBoxStyle}>
          <AppFlexLayout direction="column" gap={2} align={alignStart}>
            <Typography variant="subtitle1" fontWeight={700}>
              Sitemap
            </Typography>
            <Stack spacing={1} alignItems="flex-start">
              {navbarMenu.map((item) => (
                <Link
                  key={item.id}
                  component={RouterLink}
                  to={item.path}
                  variant="body2"
                  color="text.secondary"
                  underline="none"
                  sx={{
                    display: "inline-block",
                    transition: theme.transitions.create(
                      ["color", "transform"],
                      { duration: 200 }
                    ),
                    "&:hover": {
                      color: theme.palette.primary.main,
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </AppFlexLayout>
        </Box>

        {/* Socials */}
        <Box sx={columnBoxStyle}>
          <AppFlexLayout direction="column" gap={2} align={alignStart}>
            <Typography variant="subtitle1" fontWeight={700}>
              Socials
            </Typography>
            <Stack spacing={1.5} alignItems="flex-start">
              {Object.entries(INFO.socials).map(([platform, url]) => {
                if (!socialIcons[platform]) return null;
                return (
                  <Link
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    color="text.secondary"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      transition: theme.transitions.create(
                        ["color", "transform"],
                        { duration: 200 }
                      ),
                      "&:hover": {
                        color: theme.palette.primary.main,
                        transform: "translateX(4px)",
                      },
                    }}
                  >
                    {socialIcons[platform]}
                    <Typography
                      variant="body2"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {platform}
                    </Typography>
                  </Link>
                );
              })}
            </Stack>
          </AppFlexLayout>
        </Box>

        {/* Contact */}
        <Box sx={columnBoxStyle}>
          <AppFlexLayout direction="column" gap={2} align={alignStart}>
            <Typography variant="h6" fontWeight={700}>
              Contact
            </Typography>

            <AppFlexLayout direction="column" gap={1.5} align={alignStart}>
              <Link
                href={`mailto:${INFO.main.email}`}
                underline="none"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  transition: theme.transitions.create("color"),
                  "&:hover": { color: theme.palette.primary.main },
                }}
              >
                <Mail size={16} />
                <Typography variant="body2" component="span">
                  {INFO.main.email}
                </Typography>
              </Link>

              <AppFlexLayout
                direction="row"
                align="flex-start"
                gap={1.5}
                sx={{ color: theme.palette.text.secondary }}
              >
                <MapPin size={16} />
                <Typography variant="body2" textAlign="left">
                  {INFO.main.location}
                </Typography>
              </AppFlexLayout>
            </AppFlexLayout>
          </AppFlexLayout>
        </Box>
      </AppGridLayout>

      <Divider sx={{ my: 4, borderColor: alpha(theme.palette.divider, 0.08) }} />

      {/* Bottom */}
      <AppFlexLayout
        direction={{ xs: "column-reverse", sm: "row" }}
        justify={{ xs: "flex-start", sm: "space-between" }}
        align={{ xs: "flex-start", sm: "center" }}
        gap={2}
      >
        <Typography variant="caption" color="text.secondary" textAlign="left">
          © {new Date().getFullYear()} {INFO.main.title}. All rights reserved.
        </Typography>

        <AppFlexLayout direction="row" gap={2} align="center">
          <Link
            component={RouterLink}
            to="/privacy"
            variant="caption"
            color="text.secondary"
            underline="none"
            sx={{ "&:hover": { color: theme.palette.primary.main } }}
          >
            Privacy
          </Link>
          <Link
            component={RouterLink}
            to="/terms"
            variant="caption"
            color="text.secondary"
            underline="none"
            sx={{ "&:hover": { color: theme.palette.primary.main } }}
          >
            Terms
          </Link>
        </AppFlexLayout>
      </AppFlexLayout>
    </Box>
  );
};

export default memo(Footer);