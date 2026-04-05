import { useRef } from "react";
import { Box, useTheme } from "@mui/material";
import { motion } from "framer-motion";

/**
 * @typedef {Object} Rock
 * @property {number} id
 * @property {number} size
 * @property {number} startX
 * @property {number} startY
 * @property {number} endX
 * @property {number} endY
 * @property {number} duration
 * @property {number} delay
 * @property {number} opacity
 * @property {number} rotate
 * @property {string} borderRadius
 * @property {string} clip
 */

/**
 * Menghasilkan konfigurasi asteroid secara acak untuk animasi.
 *
 * @returns {Rock[]} Array objek asteroid dengan properti animasi dan bentuk acak.
 */
const generateRocks = () => {
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
};

/**
 * Komponen visual untuk menampilkan animasi asteroid bergerak di background.
 * Hanya dirender ketika mode tema aktif adalah dark.
 *
 * @returns {JSX.Element|null} Elemen background animasi atau null jika bukan mode dark.
 */
const Asteroids = () => {
  const theme = useTheme();
  const rocksRef = useRef(generateRocks());

  if (theme.palette.mode !== "dark") return null;

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
      {rocksRef.current.map((rock) => (
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
            background:
              "radial-gradient(circle at 30% 30%, #777 0%, #444 45%, #1a1a1a 100%)",
            filter: "blur(0.3px)",
          }}
        />
      ))}
    </Box>
  );
};

export default Asteroids;