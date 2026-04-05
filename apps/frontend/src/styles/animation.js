import { keyframes } from "@mui/system";

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
