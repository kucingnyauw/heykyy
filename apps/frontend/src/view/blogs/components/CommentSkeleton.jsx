import React, { memo } from "react";
import { Box, Skeleton, useTheme } from "@mui/material";

const CommentSkeleton = memo(() => {
  const theme = useTheme();
  return (
    <Box sx={{ width: "100%", py: 1 }}>
      <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
        <Skeleton variant="circular" width={36} height={36} />
        <Skeleton 
          variant="rectangular" 
          sx={{ 
            flex: 1, 
            width: "100%", 
            height: 110, 
            borderRadius: theme.shape.borderRadius 
          }} 
        />
      </Box>
    </Box>
  );
});

export default CommentSkeleton;