import moon from "@assets/moon.webp";
import { useTheme, alpha, Box } from "@mui/material";
import { motion } from "framer-motion";
import { useParallax } from "@hooks/use-paralax";


/**
 * Moon background component with parallax and glow effects.
 * Renders only when the theme is in dark mode.
 *
 * @returns {JSX.Element|null} Moon background element or null if not in dark mode.
 */
const Moon = () => {
  const theme = useTheme();
  const parallaxY = useParallax(0.15);

  const baseGlowStyle = {
    position: "absolute",
    width: "40vw",
    height: "60vh",
    borderRadius: "50%",
    filter: "blur(120px)",
    opacity: 0.4,
    zIndex: -1,
    pointerEvents: "none"
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden"
      }}
    >
      <motion.div style={{ y: parallaxY, height: "100%", position: "relative" }}>
        <Box
          sx={{
            ...baseGlowStyle,
            left: "-10%",
            top: "10%",
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.3
            )} 0%, transparent 70%)`
          }}
        />
        <Box
          sx={{
            ...baseGlowStyle,
            right: "-10%",
            top: "20%",
            background: `radial-gradient(circle, ${alpha(
              theme.palette.info.main,
              0.2
            )} 0%, transparent 70%)`
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.15,
            background: `url(${moon}) center / cover no-repeat`,
            mixBlendMode: "screen",
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)"
          }}
        />
      </motion.div>
    </Box>
  );
};

export default Moon;