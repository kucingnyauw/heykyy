import React from "react";
import { useDevice } from "@hooks/use-device";
import { useTheme, alpha } from "@mui/material";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import PropTypes from "prop-types";

/**
 * VerticalTimeline
 * Reusable vertical timeline component.
 * Accepts array of items and custom renderers for opposite content and main content.
 */
const VerticalTimeline = ({ items = [], renderOpposite, renderContent }) => {
  const theme = useTheme();
  const { isMobile } = useDevice();

  return (
    <Timeline
      position={isMobile ? "right" : "alternate"}
      sx={{
        p: 0,
        [`& .MuiTimelineConnector-root`]: {
          bgcolor: alpha(theme.palette.primary.main, 0.2),
          width: "1px",
        },
        [`& .${timelineItemClasses.root}:before`]: isMobile
          ? { flex: 0, padding: 0 }
          : {},
      }}
    >
      {items.map((item, index) => (
        <TimelineItem key={index}>
          {/* 1. Sembunyikan kolom Opposite di mobile agar tidak memakan ruang horizontal */}
          {!isMobile && renderOpposite && (
            <TimelineOppositeContent sx={{ m: "auto 0", px: 3 }}>
              {renderOpposite(item, index, isMobile)}
            </TimelineOppositeContent>
          )}

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
              <span
                style={{
                  display: "block",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: `0 0 10px ${theme.palette.primary.main}`,
                }}
              />
            </TimelineDot>
            <TimelineConnector />
          </TimelineSeparator>

          <TimelineContent sx={{ py: "24px", px: { xs: 2, md: 3 } }}>
            {/* 2. Pindahkan hasil renderOpposite ke sini saat mobile (stack vertikal) */}
            {isMobile && renderOpposite && (
              <div style={{ marginBottom: "8px" }}>
                {renderOpposite(item, index, isMobile)}
              </div>
            )}
            
            {renderContent(item, index, isMobile)}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

VerticalTimeline.propTypes = {
  items: PropTypes.array.isRequired,
  renderOpposite: PropTypes.func,
  renderContent: PropTypes.func.isRequired,
};

export default VerticalTimeline;