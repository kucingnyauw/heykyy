import { useScroll, useTransform, useSpring } from "framer-motion";

export const useParallax = (speed = 0.15) => {
  const { scrollY } = useScroll();
  
  // Mengubah scroll pixel menjadi pergerakan Y
  const y = useTransform(scrollY, (value) => value * speed);
  
  // Opsional: Tambahkan spring agar gerakannya "smooth" (kenyal)
  const smoothY = useSpring(y, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return smoothY;
};