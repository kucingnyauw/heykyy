/**
 * @fileoverview Education history section for the About page.
 * Renders an alternating vertical timeline (on desktop) or a right-aligned timeline (on mobile).
 */

import React, { memo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, alpha, useTheme, useMediaQuery, Paper, Skeleton } from "@mui/material";
import { motion } from "framer-motion";

import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineContent from "@mui/lab/TimelineContent";

import { AppFlexLayout, AppSectionLayout } from "@heykyy/components";
import { getEducation } from "../../../service/education-service"
import AboutData from "../../../data/about"
import GridPlusDeco from "../../../ui-components/GridPlusDeco"
import { SectionHeader, fadeInVariant } from "./AboutShared";

/**
 * Renders the education section with skeleton loading states.
 * Connects to the education service API via React Query to fetch the timeline data.
 * * @returns {JSX.Element|null} The education timeline, or null if no data is found after loading.
 */
const EducationSection = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const config = AboutData.education;

  const { data: educations, isLoading: eduLoading } = useQuery({
    queryKey: ["educations"],
    queryFn: getEducation,
    staleTime: 300000,
  });

  /**
   * Formats a date string to extract just the year, or returns "Present" if null.
   * @param {string} d - Valid date string or null.
   * @returns {number|string} Formatted year or "Present".
   */
  const formatYear = useCallback((d) => (d ? new Date(d).getFullYear() : "Present"), []);

  if (!eduLoading && (!educations || educations.length === 0)) return null;

  return (
    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInVariant}>
      <AppSectionLayout sx={{ position: "relative" }}>
        <GridPlusDeco sx={{ top: "5%", left: "50%", transform: "translateX(-50%)" }} />

        <AppFlexLayout direction="column" gap={{ xs: 8, md: 12 }}>
          <SectionHeader {...config} />

          <Timeline
            position={isMobile ? "right" : "alternate"}
            sx={{
              p: 0,
              [`& .MuiTimelineConnector-root`]: {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                width: "1px",
              },
              [`& .${timelineItemClasses.root}:before`]: isMobile ? { flex: 0, padding: 0 } : {},
            }}
          >
            {(eduLoading ? Array.from({ length: 3 }) : (educations || []).slice(0, 3)).map((item, i) => (
              <TimelineItem key={i}>
                <TimelineOppositeContent
                  sx={{
                    display: isMobile ? "none" : "block",
                    m: "auto 0",
                    px: 3,
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    color: alpha(theme.palette.text.primary, 0.4),
                    fontFamily: "monospace",
                    letterSpacing: 1,
                  }}
                >
                  {eduLoading ? (
                    <Box sx={{ display: "flex", justifyContent: isMobile ? "flex-start" : (i % 2 === 0 ? "flex-end" : "flex-start") }}>
                      <Skeleton width={120} height={20} sx={{ borderRadius: theme.shape.borderRadius }} />
                    </Box>
                  ) : (
                    `${formatYear(item?.startYear)} — ${formatYear(item?.endYear)}`
                  )}
                </TimelineOppositeContent>

                <TimelineSeparator>
                  <TimelineDot
                    variant="outlined"
                    sx={{
                      p: "6px",
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                      bgcolor: alpha(theme.palette.background.default, 0.8),
                      boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: theme.palette.primary.main, boxShadow: `0 0 10px ${theme.palette.primary.main}` }} />
                  </TimelineDot>
                  <TimelineConnector />
                </TimelineSeparator>

                <TimelineContent sx={{ py: "24px", px: { xs: 2, md: 3 } }}>
                  <Paper
                    sx={(theme) => ({
                      p: { xs: 2.5, md: 3.5 },
                      borderRadius: theme.shape.borderRadius,
                      backgroundColor: alpha(theme.palette.background.paper, 0.2),
                      border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                      boxShadow: "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                    })}
                  >
                    {eduLoading ? (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                          <Skeleton width="40%" height={24} sx={{ borderRadius: theme.shape.borderRadius }} />
                          <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: theme.palette.divider }} />
                          <Skeleton width="30%" height={24} sx={{ borderRadius: theme.shape.borderRadius }} />
                        </Box>
                        
                        <Box sx={{ display: isMobile ? "block" : "none" }}>
                          <Skeleton width="30%" height={20} sx={{ borderRadius: theme.shape.borderRadius }} />
                        </Box>

                        <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: theme.shape.borderRadius, mt: 1 }} />
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 700, lineHeight: 1.25 }}>
                            {item?.title}
                          </Typography>
                          <Box sx={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: theme.palette.primary.main, opacity: 0.5 }} />
                          <Typography variant="subtitle2" sx={{ color: theme.palette.primary.main, fontWeight: 700, lineHeight: 1.25 }}>
                            {item?.institution}
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          sx={(theme) => ({
                            fontFamily: "monospace",
                            fontWeight: 600,
                            letterSpacing: 1,
                            color: theme.palette.text.secondary,
                            display: isMobile ? "block" : "none",
                          })}
                        >
                          {formatYear(item?.startYear)} — {formatYear(item?.endYear)}
                        </Typography>

                        <Typography variant="body2" sx={(theme) => ({ color: theme.palette.text.secondary, lineHeight: 1.8 })}>
                          {item?.description}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </AppFlexLayout>
      </AppSectionLayout>
    </motion.div>
  );
});

export default memo(EducationSection);