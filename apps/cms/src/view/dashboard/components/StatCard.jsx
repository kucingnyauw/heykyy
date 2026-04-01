import React, { memo } from "react";
import { Box, Card, Typography, useTheme, alpha } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/**
 * A card component displaying a key statistic metric along with its growth trend.
 *
 * @param {Object} props - Component props.
 * @param {string} props.title - The label for the statistic.
 * @param {Object} [props.value] - The metric data object.
 * @param {number} props.value.total - The total numerical value.
 * @param {number} props.value.growth - The growth percentage.
 * @param {"up"|"down"|"neutral"} props.value.trend - The growth trend direction.
 * @param {React.ElementType} props.icon - The Lucide icon component.
 * @param {string} [props.colorRaw] - Custom hex or theme color for the icon.
 * @returns {JSX.Element}
 */
const StatCard = ({ title, value, icon: Icon, colorRaw }) => {
  const theme = useTheme();
  const activeColor = colorRaw || theme.palette.primary.main;

  const total = value?.total ?? 0;
  const growth = value?.growth ?? 0;
  const trend = value?.trend ?? "neutral";

  /**
   * Determines the visual styling and icon for the trend badge based on the growth direction.
   *
   * @returns {{ icon: React.ElementType, color: string }} Styling configurations for the badge.
   */
  const getTrendDetails = () => {
    if (trend === "up") return { icon: ArrowUpRight, color: theme.palette.success.main };
    if (trend === "down") return { icon: ArrowDownRight, color: theme.palette.error.main };
    return { icon: Minus, color: theme.palette.text.secondary };
  };

  const { icon: TrendIcon, color: trendColor } = getTrendDetails();

  return (
    <Card
      sx={{
        p: 2.5,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        "&:hover": {
          borderColor: alpha(activeColor, 0.4),
          bgcolor: alpha(activeColor, 0.02),
          transform: "translateY(-2px)",
        },
      }}
    >
      <AppFlexLayout justify="space-between" align="flex-start" sx={{ width: "100%" }}>
        <Box
          sx={{
            p: 1.2,
            borderRadius: "10px",
            bgcolor: theme.palette.custom.surface.muted,
            color: activeColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={20} strokeWidth={1.5} />
        </Box>
        
        <AppFlexLayout 
          gap={0.5} 
          align="center" 
          sx={{ 
            color: trendColor, 
            bgcolor: alpha(trendColor, 0.1), 
            px: 1, 
            py: 0.5, 
            borderRadius: "6px" 
          }}
        >
          <TrendIcon size={14} strokeWidth={2} />
          <Typography variant="caption" fontWeight={600}>
            {Math.abs(growth)}%
          </Typography>
        </AppFlexLayout>
      </AppFlexLayout>

      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
          {Number.isFinite(total) ? total.toLocaleString() : 0}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
      </Box>
    </Card>
  );
};

export default memo(StatCard);