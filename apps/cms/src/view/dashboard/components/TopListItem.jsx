import React, { memo } from "react";
import { Box, Typography, useTheme, alpha } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";
import { Calendar, Eye } from "lucide-react";
import { DateUtils } from "@heykyy/utils-frontend";

/**
 * A list item component representing a top-ranked entry.
 *
 * @param {Object} props
 * @param {number} props.rank - The numerical ranking position.
 * @param {string} props.title - The title of the entry.
 * @param {number|string} props.meta - The meta value (views/likes).
 * @param {string} props.date - ISO string date of creation.
 * @param {string} [props.color] - Optional accent color.
 * @returns {JSX.Element}
 */
const TopListItem = ({ rank, title, meta, date, color }) => {
  const theme = useTheme();

  return (
    <AppFlexLayout
      justify="space-between"
      align="center"
      wrap="nowrap"
      sx={{
        width: "100%",
        py: 1.25,
        px: 1.5,
        mb: 0.5,
        borderRadius: theme.shape.borderRadius,
        transition: "all 0.2s ease-in-out",
        border: "0.5px solid transparent",
        "&:hover": {
          bgcolor: theme.palette.custom.surface.muted,
          borderColor: theme.palette.custom.border.default,
        },
      }}
    >
      <AppFlexLayout gap={2.5} align="center" sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            minWidth: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: rank === 1 ? color : theme.palette.custom.surface.muted,
            color:
              rank === 1
                ? theme.palette.common.white
                : theme.palette.text.secondary,
            borderRadius: "6px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {rank}
        </Typography>

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            fontWeight={500}
            noWrap
            sx={{ mb: 0.1, color: theme.palette.text.primary }}
          >
            {title}
          </Typography>
          <AppFlexLayout
            gap={0.5}
            align="center"
            sx={{ color: theme.palette.text.secondary }}
          >
            <Calendar size={11} strokeWidth={1.5} />
            <Typography variant="caption" sx={{ fontSize: "0.65rem" }}>
              {DateUtils.formatDate(date)}
            </Typography>
          </AppFlexLayout>
        </Box>
      </AppFlexLayout>

      <Box sx={{ textAlign: "right", ml: 2, flexShrink: 0 }}>
        <Typography
          variant="caption"
          fontWeight={500}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: theme.palette.text.secondary,
          }}
        >
          <Eye size={12} strokeWidth={1.5} />
          {meta}
        </Typography>
      </Box>
    </AppFlexLayout>
  );
};

export default memo(TopListItem);
