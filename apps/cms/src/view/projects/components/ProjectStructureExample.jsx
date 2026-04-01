import React from "react";
import { Box, Typography, useTheme } from "@mui/material";

const ProjectStructureExample = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        mt: 3,
        mb: 3,
        p: 2.5,
        borderRadius: theme.shape.borderRadius,
        border: `0.5px dashed ${theme.palette.custom.border.subtle}`,
        bgcolor: theme.palette.custom.surface.muted,
      }}
    >
      {/* Label */}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: ".06em",
          color: "text.secondary",
          display: "block",
          mb: 1.5,
        }}
      >
        Example Project Structure
      </Typography>

      {/* Content container */}
      <Box
        sx={{
          p: 2,
          borderRadius: theme.shape.borderRadius,
          border: `0.5px solid ${theme.palette.custom.border.default}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        {/* Title */}
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 1.5,
          }}
        >
          Building a Scalable Design System
        </Typography>

        {/* Description */}
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
          This project explores how we improved UI consistency across multiple
          products while reducing engineering overhead.
        </Typography>

        {/* Section: Challenge */}
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary", mb: 0.75 }}
        >
          The Challenge
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Our interfaces lacked standardization, causing slow delivery and
          inconsistent user experience.
        </Typography>

        {/* Section: Solution */}
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary", mb: 0.75 }}
        >
          The Solution
        </Typography>

        <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
          {[
            "Introduced design tokens",
            "Unified component patterns",
            "Improved accessibility",
          ].map((item) => (
            <Typography
              key={item}
              component="li"
              variant="body2"
              sx={{ color: "text.secondary", mb: 0.5 }}
            >
              {item}
            </Typography>
          ))}
        </Box>

        {/* Quote */}
        <Box
          sx={{
            pl: 1.5,
            borderLeft: `2px solid ${theme.palette.primary.main}`,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontStyle: "italic",
              color: "text.secondary",
            }}
          >
            Consistency is what makes products feel reliable.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(ProjectStructureExample);