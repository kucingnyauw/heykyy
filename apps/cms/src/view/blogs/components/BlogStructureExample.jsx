import React from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";

const BlogStructureExample = () => {
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
        Example Blog Structure
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

        {/* Paragraph */}
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>
          Creating a design system is not just about components—it’s about
          establishing a shared language between designers and engineers.
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          In this article, we explore practical strategies for improving UI
          consistency while keeping development efficient.
        </Typography>

        {/* Section */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 0.75,
          }}
        >
          Why It Matters
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          Without a design system, products often drift into visual
          inconsistency, making them harder to scale and maintain.
        </Typography>

        {/* List */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            mb: 0.75,
          }}
        >
          Key Takeaways
        </Typography>

        <Box component="ul" sx={{ pl: 2, mb: 2, mt: 0 }}>
          {[
            "Start with strong design tokens",
            "Standardize component behavior",
            "Prioritize accessibility from day one",
            "Document everything clearly",
          ].map((item) => (
            <Typography
              key={item}
              component="li"
              variant="body2"
              sx={{
                color: "text.secondary",
                mb: 0.5,
              }}
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
            Great design systems don’t restrict creativity — they enable teams
            to move faster with confidence.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(BlogStructureExample);