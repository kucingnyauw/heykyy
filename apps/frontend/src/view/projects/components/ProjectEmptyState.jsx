/**
 * Komponen yang ditampilkan ketika tidak ada data proyek yang ditemukan.
 * * @returns {JSX.Element} Tampilan empty state
 */
import React, { memo } from "react";
import { Typography } from "@mui/material";
import { AppFlexLayout } from "@heykyy/components";

const ProjectEmptyState = memo(() => {
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
      <Typography variant="h5" fontWeight="bold">
        No Projects Found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        It looks like there are no projects available at the moment. Try
        adjusting your search or filter to find what you're looking for.
      </Typography>
    </AppFlexLayout>
  );
});

export default ProjectEmptyState;