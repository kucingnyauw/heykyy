import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import { fadeInVariant } from "@styles/animation";

/**
 * AnimatedSection
 * Wrapper component untuk memberikan efek animasi fade-in saat muncul di viewport.
 */
const AnimatedSection = ({ children, once = true, margin = "-100px", variants }) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin }}
      variants={variants || fadeInVariant}
    >
      {children}
    </motion.div>
  );
};

AnimatedSection.propTypes = {
  children: PropTypes.node.isRequired,
  once: PropTypes.bool,
  margin: PropTypes.string,
  variants: PropTypes.object,
};

export default AnimatedSection;