const INFO = {
  main: {
    title: import.meta.env.VITE_SITE_NAME,
    description: import.meta.env.VITE_SITE_DESCRIPTION,
    email: import.meta.env.VITE_EMAIL || "h3y.kyy@gmail.com",
    location: import.meta.env.VITE_LOCATION || "Tangerang, Indonesia",
    phone: import.meta.env.VITE_PHONE || "+6285813698485",
  },

  socials: {
    twitter: import.meta.env.VITE_TWITTER_URL || "https://twitter.com/",
    github: import.meta.env.VITE_GITHUB_URL || "https://github.com/",
    linkedin: import.meta.env.VITE_LINKEDIN_URL || "https://linkedin.com/",
    instagram: import.meta.env.VITE_INSTAGRAM_URL || "https://instagram.com/",
    stackoverflow:
      import.meta.env.VITE_STACKOVERFLOW_URL || "https://stackoverflow.com/",
    facebook: import.meta.env.VITE_FACEBOOK_URL || "https://facebook.com/",
  },
};

export default INFO;
