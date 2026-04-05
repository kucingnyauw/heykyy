import { useRef } from "react";
import { motion } from "framer-motion";

/**
 * @typedef {Object} Star
 * @property {number} id
 * @property {number} size
 * @property {string} top
 * @property {string} left
 * @property {number} duration
 * @property {number} delay
 */

/**
 * Menghasilkan konfigurasi bintang secara acak.
 *
 * @returns {Star[]} Array konfigurasi bintang.
 */
const generateStars = () => {
  return Array.from({ length: 70 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 1,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }));
};

/**
 * Komponen untuk menampilkan efek bintang tersebar dengan animasi twinkle.
 *
 * @returns {JSX.Element}
 */
const StarsSpread = () => {
  const starsRef = useRef(generateStars());

  return (
    <>
      {starsRef.current.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.1, scale: 0.5 }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top: star.top,
            left: star.left,
            width: star.size,
            height: star.size,
            backgroundColor: "#fff",
            borderRadius: "50%",
            boxShadow: "0 0 5px rgba(255, 255, 255, 0.3)",
          }}
        />
      ))}
    </>
  );
};

export default StarsSpread;