/**
 * @fileoverview Komponen CommentSkeleton sebagai placeholder loading untuk CommentItem.
 * Mengikuti struktur layout Level 0 (Parent) dari sistem komentar.
 */

import React from "react";
import { Box, useTheme, alpha, Skeleton } from "@mui/material";

/**
 * Komponen Skeleton untuk CommentItem.
 * Menampilkan struktur Avatar di sebelah kiri dan Box konten di sebelah kanan.
 *
 * @component
 * @returns {JSX.Element} Tampilan skeleton komentar.
 */
const CommentSkeleton = () => {
  const theme = useTheme();
  const radius = theme.shape.borderRadius;
  const skeletonColor = alpha(theme.palette.text.primary, 0.08);

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        mb: 4, // Sesuai dengan mb: 4/5 pada CommentItem level 0
      }}
    >
      <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2.5 } }}>
        
        {/* BAGIAN AVATAR SKELETON */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "44px",     // Fixed width untuk parent avatar
            minWidth: "44px",
          }}
        >
          <Skeleton
            variant="circular"
            width={40} // Ukuran avatar "sm" standar
            height={40}
            animation="wave"
            sx={{ bgcolor: skeletonColor }}
          />
        </Box>

        {/* BAGIAN KONTEN KOMENTAR SKELETON */}
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: radius,
              backgroundColor: alpha(theme.palette.action.hover, 0.03),
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* HEADER SKELETON (Name & Options Icon) */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1.5, // Jarak ke konten tulisan
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Nama User Skeleton */}
                <Skeleton
                  variant="rounded"
                  width={120}
                  height={18}
                  animation="wave"
                  sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
                />
                {/* Timestamp Skeleton */}
                <Skeleton
                  variant="rounded"
                  width={70}
                  height={14}
                  animation="wave"
                  sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
                />
              </Box>

              {/* Three dots option skeleton */}
              <Skeleton
                variant="circular"
                width={16}
                height={16}
                animation="wave"
                sx={{ bgcolor: skeletonColor }}
              />
            </Box>

            {/* ISI KONTEN SKELETON (Dibuat seolah-olah ada 2-3 baris teks) */}
            <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 0.8 }}>
              <Skeleton
                variant="rounded"
                width="100%"
                height={18}
                animation="wave"
                sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
              />
              <Skeleton
                variant="rounded"
                width="90%"
                height={18}
                animation="wave"
                sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
              />
              <Skeleton
                variant="rounded"
                width="60%"
                height={18}
                animation="wave"
                sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
              />
            </Box>

            {/* FOOTER ACTION SKELETON (Tombol Reply & View Replies) */}
            <Box sx={{ display: "flex", gap: 3, mt: 3 }}>
              <Skeleton
                variant="rounded"
                width={40}
                height={16}
                animation="wave"
                sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
              />
              <Skeleton
                variant="rounded"
                width={80}
                height={16}
                animation="wave"
                sx={{ bgcolor: skeletonColor, borderRadius: 1 }}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentSkeleton;