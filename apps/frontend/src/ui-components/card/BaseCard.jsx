import React from "react";
import PropTypes from "prop-types";
import {
  useTheme,
  Box,
  Typography,
  Card,
  CardContent,
  alpha,
} from "@mui/material";

/**
 * Komponen BaseCard sebagai wadah dasar dengan header opsional (ikon, judul, subjudul).
 * @param {Object} props - Properti komponen.
 * @param {React.ReactNode} [props.icon] - Ikon yang ditampilkan di bagian header.
 * @param {React.ReactNode} [props.title] - Judul utama pada header.
 * @param {React.ReactNode} [props.subtitle] - Subjudul pada header.
 * @param {React.ReactNode} [props.children] - Konten di dalam card.
 * @param {Object} [props.sx] - Styling tambahan menggunakan MUI sx prop.
 */
const BaseCard = ({ icon, title, subtitle, children, sx, ...props }) => {
  const theme = useTheme();
  const hasHeader = icon || title || subtitle;

  const headerContent = hasHeader ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {title && (
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.4}>
            {title}
          </Typography>
        )}
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  ) : null;

  return (
    <Card
      {...props}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.background.default, 0.2),
        transition: theme.transitions.create(
          ["transform", "border-color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        ...(props.onClick && {
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: theme.palette.primary.main,
            boxShadow: `0 8px 24px ${alpha(theme.palette.text.primary, 0.06)}`,
          },
        }),
        ...sx,
      }}
    >
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {headerContent}
        {children && <Box>{children}</Box>}
      </CardContent>
    </Card>
  );
};

BaseCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  sx: PropTypes.object,
};

export default BaseCard;