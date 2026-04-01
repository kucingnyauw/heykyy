import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";

/**
 * Component to render consistent titles with icons across forms.
 *
 * @param {Object} props - Component props
 * @param {string} props.title - Primary section title
 * @param {string} [props.subtitle] - Optional description text
 * @param {React.ElementType} props.icon - Lucide icon component
 * @returns {JSX.Element}
 */
const SectionHeader = ({ title, subtitle, icon: Icon }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ mb: 3 }}>
      <AppFlexLayout gap={1.5} align="center">
        <Box
          sx={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          <Icon size={16} />
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
      </AppFlexLayout>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 0.75, display: "block", maxWidth: 520, lineHeight: 1.4 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(SectionHeader);