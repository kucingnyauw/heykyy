/**
 * @fileoverview Kumpulan komponen pendukung dan dekorasi untuk halaman About.
 */

import React, { useMemo, memo } from "react";
import { Box, Chip, alpha, useTheme, useMediaQuery } from "@mui/material";
import { Sparkle } from "lucide-react";
import { motion } from "framer-motion";
import { AppFlexLayout, AppTitle, AppSubtitle } from "@heykyy/components";

/**
 * Konfigurasi varian Framer Motion untuk animasi masuk dengan efek memudar (fade in).
 */
export const fadeInVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

/**
 * Komponen latar belakang animasi batu asteroid melayang (khusus mode gelap).
 * @returns {JSX.Element|null}
 */
export const Asteroids = memo(() => {
  const theme = useTheme();
  if (theme.palette.mode !== "dark") return null;

  const rocks = useMemo(() => {
    const randomRadius = () => {
      const r = () => Math.floor(Math.random() * 40) + 30;
      return `${r()}% ${r()}% ${r()}% ${r()}% / ${r()}% ${r()}% ${r()}% ${r()}%`;
    };
    const randomClip = () => {
      const points = Array.from({ length: 6 })
        .map(() => `${Math.random() * 100}% ${Math.random() * 100}%`)
        .join(", ");
      return `polygon(${points})`;
    };

    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 12 + 6,
      startX: Math.random() * 120 - 10,
      startY: Math.random() * 120 - 10,
      endX: Math.random() * 120 - 10,
      endY: Math.random() * 120 - 10,
      duration: 25 + Math.random() * 30,
      delay: Math.random() * -30,
      opacity: Math.random() * 0.4 + 0.3,
      rotate: 180 + Math.random() * 720,
      borderRadius: randomRadius(),
      clip: randomClip(),
    }));
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: -1,
      }}
    >
      {rocks.map((rock) => (
        <motion.div
          key={rock.id}
          initial={{
            x: `${rock.startX}vw`,
            y: `${rock.startY}vh`,
            rotate: 0,
            opacity: 0,
          }}
          animate={{
            x: `${rock.endX}vw`,
            y: `${rock.endY}vh`,
            rotate: rock.rotate,
            opacity: [0, rock.opacity, rock.opacity, 0],
          }}
          transition={{
            duration: rock.duration,
            delay: rock.delay,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: rock.size,
            height: rock.size,
            borderRadius: rock.borderRadius,
            clipPath: rock.clip,
            background: `radial-gradient(circle at 30% 30%, #777 0%, #444 45%, #1a1a1a 100%)`,
            filter: "blur(0.3px)",
          }}
        />
      ))}
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
const SectionTag = memo(({ label, icon: Icon }) => {
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