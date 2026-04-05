import { Box } from "@mui/material";
import { starFall } from "@styles/animation";

/**
 * @typedef {Object} StarConfig
 * @property {string} left
 * @property {number} height
 * @property {string} duration
 * @property {string} [delay]
 */

/**
 * Konfigurasi posisi dan animasi bintang jatuh.
 * Bersifat statis dan tidak berubah selama lifecycle aplikasi.
 *
 * @type {StarConfig[]}
 */
const starsConfig = [
  { left: "15%", height: 80, duration: "18s" },
  { left: "35%", height: 60, duration: "22s", delay: "4s" },
  { left: "55%", height: 100, duration: "16s" },
  { left: "75%", height: 70, duration: "24s", delay: "6s" },
];

/**
 * Komponen visual untuk menampilkan animasi bintang jatuh di background.
 *
 * @returns {JSX.Element} Elemen background berisi animasi bintang.
 */
const StarsFall = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 9,
      }}
    >
      {starsConfig.map((star, index) => (
        <Box
          key={index}
          sx={{
            position: "absolute",
            top: "-20%",
            left: star.left,
            width: "0.5px",
            height: star.height,
            background:
              "linear-gradient(180deg, rgba(220,235,255,0.6), transparent)",
            animation: `${starFall} ${star.duration} linear infinite`,
            animationDelay: star.delay ?? "0s",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: "-1px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "1px",
              height: "1px",
              borderRadius: "50%",
              background: "rgba(235,245,255,0.8)",
            },
          }}
        />
      ))}
    </Box>
  );
};

export default StarsFall;