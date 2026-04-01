/**
 * @fileoverview Kumpulan animasi, varian, dan komponen dekorasi yang digunakan bersama
 * di berbagai seksi pada halaman Homepage.
 */

import React, { useMemo, memo } from "react";
import { Box, Chip, alpha, useTheme, useMediaQuery } from "@mui/material";
import { keyframes } from "@mui/system";
import { Sparkle } from "lucide-react";
import { AppFlexLayout, AppTitle, AppSubtitle } from "@heykyy/components";

/**
 * Keyframes untuk animasi elemen berjalan secara horizontal tanpa batas.
 */
export const smoothRunning = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } 
`;

/**
 * Keyframes untuk animasi bintang jatuh.
 */
export const starFall = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(140vh); opacity: 0; }
`;

/**
 * Konfigurasi varian Framer Motion untuk animasi masuk dengan efek memudar (fade in).
 */
export const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/**
 * Komponen dekorasi kotak bergaris dengan gradien linear.
 * @param {object} props - Properti komponen.
 * @param {object} [props.sx] - Custom style MUI tambahan.
 * @returns {JSX.Element}
 */
export const BoxedDeco = memo(({ sx }) => {
  const theme = useTheme();

  const boxStyle = useMemo(
    () => ({
      width: 80,
      height: 80,
      border: `0.5px solid ${alpha(theme.palette.divider, 0.5)}`,
      background: `linear-gradient(180deg, ${alpha(
        theme.palette.text.disabled,
        0.8
      )} 0%, ${alpha(theme.palette.background.default, 0.2)} 100%)`,
      zIndex: -2,
    }),
    [theme]
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        position: "absolute",
        top: { xs: 20, md: 0 },
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        width: "100vw",
        pointerEvents: "none",
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", pointerEvents: "auto" }}>
        <Box sx={boxStyle} />
        <Box sx={{ ...boxStyle, ml: 10.25, mt: 0 }} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", pointerEvents: "auto" }}>
        <Box sx={boxStyle} />
        <Box sx={{ ...boxStyle, mr: 10.25, mt: 0 }} />
      </Box>
    </Box>
  );
});



/**
 * Komponen dekorasi silang menggunakan garis putus-putus.
 * @param {object} props - Properti komponen.
 * @param {object} [props.sx] - Custom style MUI tambahan.
 * @returns {JSX.Element}
 */
export const HashDashedDeco = memo(({ sx }) => {
  const theme = useTheme();
  const color = alpha(theme.palette.text.secondary, 0.3);

  return (
    <Box
      sx={{
        position: "absolute",
        width: 250,
        height: 250,
        zIndex: -2,
        pointerEvents: "none",
        maskImage: "radial-gradient(circle, black 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 80%)",
        ...sx,
      }}
    >
      <Box sx={{ position: "absolute", width: "1px", height: "100%", left: "40%", borderLeft: `1px dashed ${color}` }} />
      <Box sx={{ position: "absolute", width: "1px", height: "100%", left: "60%", borderLeft: `1px dashed ${color}` }} />
      <Box sx={{ position: "absolute", height: "1px", width: "100%", top: "40%", borderTop: `1px dashed ${color}` }} />
      <Box sx={{ position: "absolute", height: "1px", width: "100%", top: "60%", borderTop: `1px dashed ${color}` }} />
      <Box sx={{ position: "absolute", width: "10px", height: "1px", top: "50%", left: "calc(50% - 5px)", bgcolor: color }} />
      <Box sx={{ position: "absolute", width: "1px", height: "10px", left: "50%", top: "calc(50% - 5px)", bgcolor: color }} />
    </Box>
  );
});


/**
 * Komponen dekorasi pola jaring bintik (dot grid).
 * @param {object} props - Properti komponen.
 * @param {object} [props.sx] - Custom style MUI tambahan.
 * @returns {JSX.Element}
 */
export const DotGridDeco = memo(({ sx }) => {
  const theme = useTheme();
  const dotColor = alpha(theme.palette.text.disabled, 0.25);

  return (
    <Box
      sx={{
        position: "absolute",
        width: 250,
        height: 250,
        zIndex: -2,
        pointerEvents: "none",
        backgroundImage: `radial-gradient(${dotColor} 2px, transparent 2px)`,
        backgroundSize: "24px 24px",
        maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        ...sx,
      }}
    />
  );
});

/**
 * Komponen dekorasi sederhana berbentuk tanda tambah (cross).
 * @param {object} props - Properti komponen.
 * @param {object} [props.sx] - Custom style MUI tambahan.
 * @returns {JSX.Element}
 */
export const CrossDeco = memo(({ sx }) => {
  const theme = useTheme();
  const lineColor = alpha(theme.palette.divider, 0.5);

  return (
    <Box sx={{ position: "absolute", width: 80, height: 80, zIndex: -2, pointerEvents: "none", ...sx }}>
      <Box sx={{ position: "absolute", width: "100%", height: "1px", top: "50%", bgcolor: lineColor }} />
      <Box sx={{ position: "absolute", width: "1px", height: "100%", left: "50%", bgcolor: lineColor }} />
    </Box>
  );
});

/**
 * Komponen label kecil (chip) untuk mengindikasikan kategori section.
 * @param {object} props - Properti komponen.
 * @param {string} props.label - Teks label yang ditampilkan.
 * @param {React.ElementType} [props.icon] - Komponen ikon opsional.
 * @returns {JSX.Element}
 */
export const SectionTag = memo(({ label, icon: Icon }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Chip
      icon={Icon ? <Icon fill="currentColor" size={isMobile ? 14 : 18} /> : <Sparkle size={isMobile ? 14 : 18} />}
      label={label}
      sx={{
        px: isMobile ? 0.5 : 1,
        height: isMobile ? 28 : 36,
        borderRadius: "99px",
        bgcolor: alpha(theme.palette.text.disabled, theme.palette.mode === "dark" ? 0.8 : 0.08),
        fontWeight: 500,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        backdropFilter: "blur(8px)",
        "& .MuiChip-label": {
          px: isMobile ? 1 : 1.5,
        },
      }}
    />
  );
});

/**
 * Komponen header untuk setiap section yang membungkus judul, subjudul, dan label.
 * @param {object} props - Properti komponen.
 * @param {string} [props.label] - Teks label pada chip section.
 * @param {React.ElementType} [props.icon] - Ikon untuk chip section.
 * @param {string} [props.title] - Judul utama section.
 * @param {string} [props.subTitle] - Subjudul section.
 * @returns {JSX.Element}
 */
export const SectionHeader = memo(({ label, icon, title, subTitle }) => (
  <AppFlexLayout direction="column" align="center" gap={{ xs: 4, md: 6 }} sx={{ textAlign: "center" }}>
    {label && <SectionTag label={label} icon={icon} />}
    <AppFlexLayout direction="column" gap={4}>
      {title && <AppTitle text={title} />}
      {subTitle && <AppSubtitle text={subTitle} />}
    </AppFlexLayout>
  </AppFlexLayout>
));