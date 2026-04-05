import React from "react";
import { Github, Linkedin, Twitter, Instagram, Facebook, Sparkle } from "lucide-react";

/**
 * Mengembalikan icon social media sesuai key.
 * @param {string} key - Nama social media (github, linkedin, twitter, instagram, facebook)
 * @returns {React.Element} Icon yang sesuai
 */
export function getSocialIcon(key) {
  const icons = {
    github: React.createElement(Github, { size: 20 }),
    linkedin: React.createElement(Linkedin, { size: 20 }),
    twitter: React.createElement(Twitter, { size: 20 }),
    instagram: React.createElement(Instagram, { size: 20 }),
    facebook: React.createElement(Facebook, { size: 20 }),
  };

  return icons[key] || React.createElement(Sparkle, { size: 20 });
}