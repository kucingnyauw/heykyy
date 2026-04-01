import React from "react";
import { Box, Typography, Card, useTheme } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";
import { Globe } from "lucide-react";

/**
 * Component to preview how the blog post will appear in search engines.
 * @param {object} props - Component props
 * @param {string} props.seoUrl - The mock URL
 * @param {string} props.displayMetaTitle - The formatted meta title
 * @param {string} props.displayMetaDesc - The formatted meta description
 * @returns {JSX.Element}
 */
const SeoPreviewCard = ({ seoUrl, displayMetaTitle, displayMetaDesc }) => {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        p: 2,
        borderRadius: theme.shape.borderRadius,
      
      }}
    >
      <AppFlexLayout gap={1} sx={{ mb: 1 }}>
        <Box
          sx={{
            p: 0.5,
            bgcolor: theme.palette.background.paper,
            borderRadius: "50%",
            display: "flex",
          }}
        >
          <Globe size={14} color={theme.palette.text.secondary} />
        </Box>
        <Box>
          <Typography variant="caption" display="block" sx={{ lineHeight: 1 }}>
            Heykyy
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 1,
              overflow: "hidden",
            }}
          >
            {seoUrl}
          </Typography>
        </Box>
      </AppFlexLayout>
      <Typography
  variant="subtitle1"
  sx={{ color: "#6ea8fe", mb: 0.5 }}
>
        {displayMetaTitle}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: theme.palette.text.secondary,
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
          overflow: "hidden",
        }}
      >
        {displayMetaDesc}
      </Typography>
    </Card>
  );
};

export default React.memo(SeoPreviewCard);