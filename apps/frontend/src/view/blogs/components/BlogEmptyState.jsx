/**
 * @fileoverview Komponen yang ditampilkan ketika tidak ada data artikel blog yang ditemukan.
 */

import React, { memo } from "react";
import { Box, Typography, useTheme, alpha } from "@mui/material";
import { BookOpen } from "lucide-react";
import { AppFlexLayout } from "@heykyy/components";

const BlogEmptyState = memo(() => {
  const theme = useTheme();
  return (
    <AppFlexLayout
      direction="column"
      align="center"
      justify="center"
      gap={2}
      sx={{
        width: "100%",
        minHeight: "50vh",
        textAlign: "center",
        position: "relative",
      }}
    >
      <Box
        sx={{
          p: 3,
          borderRadius: "50%",
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          color: theme.palette.primary.main,
          mb: 1,
        }}
      >
        <BookOpen size={40} strokeWidth={1.5} />
      </Box>
      <Typography variant="h5" fontWeight="bold">
        No Articles Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        It looks like there are no articles available at the moment. Try
        adjusting your search or filter to find what you're looking for.
      </Typography>
    </AppFlexLayout>
  );
});

export default BlogEmptyState;