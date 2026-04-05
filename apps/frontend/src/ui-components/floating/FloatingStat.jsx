import { Box, Typography, useTheme, alpha } from "@mui/material";
import { motion } from "framer-motion";
import PropTypes from "prop-types";

const FloatingStat = ({
  title,
  subtitle,
  top,
  bottom,
  left,
  right,
  delay = 0,
  yAnimate = [0, -10, 0],
  sx,
}) => {
  const theme = useTheme();

  const resolvePos = (pos) =>
    typeof pos === "object" ? pos.md || pos.xs : pos;

  return (
    <Box
      component={motion.div}
      animate={{ y: yAnimate }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay }}
      sx={{
        position: "absolute",
        top: resolvePos(top),
        bottom: resolvePos(bottom),
        left: resolvePos(left),
        right: resolvePos(right),
        zIndex: 2,
        p: { xs: "8px 14px", md: "12px 20px" },
        borderRadius: theme.shape.borderRadius,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: alpha(theme.palette.background.paper, 0.4),
        border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        boxShadow: theme.shadows[4],
        ...sx,
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
      {subtitle && (
        <Typography
          variant="caption"
          sx={{ opacity: 0.8, color: "text.secondary", textAlign: "center" }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

FloatingStat.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  top: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  bottom: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  left: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  right: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  delay: PropTypes.number,
  yAnimate: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
  sx: PropTypes.object,
};

export default FloatingStat;
