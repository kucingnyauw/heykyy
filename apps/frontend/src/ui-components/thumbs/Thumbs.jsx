import React from "react";
import { useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";

/**
 * AnimatedThumb
 * Thumbs up icon dengan animasi saat liked
 * Props:
 *  - liked: boolean, true jika diklik/liked
 *  - size: number, ukuran icon (default 18)
 */
const Thumbs = ({ liked, size = 18 }) => {
  const theme = useTheme();

  return (
    <motion.div
      animate={liked ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <ThumbsUp
        size={size}
        fill={liked ? theme.palette.primary.main : "none"}
        color={liked ? theme.palette.primary.main : "currentColor"}
      />
    </motion.div>
  );
};

export default Thumbs;