import { useScroll, useTransform, useSpring } from "framer-motion";

/**
 * Hook untuk menghasilkan efek parallax berbasis scroll dengan smoothing menggunakan spring.
 *
 * @param {number} [speed=0.15] Faktor kecepatan parallax terhadap scroll.
 * Nilai lebih kecil menghasilkan gerakan lebih lambat, nilai lebih besar lebih responsif.
 *
 * @returns {import("framer-motion").MotionValue<number>} Nilai Y yang sudah ditransformasi dan di-smooth,
 * siap digunakan pada properti animasi seperti `style={{ y }}`.
 */
export const useParallax = (speed = 0.15) => {
  const { scrollY } = useScroll();

  const transformedY = useTransform(scrollY, (value) => value * speed);

  const smoothY = useSpring(transformedY, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return smoothY;
};