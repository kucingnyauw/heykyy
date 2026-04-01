const BASE_URL =
  import.meta.env.VITE_SITE_URL || "http://localhost:5173";

const SITE_NAME =
  import.meta.env.VITE_SITE_NAME || "Heykyy";

const TWITTER_HANDLE =
  import.meta.env.VITE_TWITTER_HANDLE || "@heykyy";

const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

const SEO = [
  {
    page: "home",
    path: "/",
    title: `${SITE_NAME} | Full-Stack Developer & Software Engineer`,
    description:
      "Heykyy - Full-Stack Developer building high-performance, scalable web and mobile applications.",
    canonical: `${BASE_URL}/`,
    robots: "index, follow",
    og: {
      title: `${SITE_NAME} | Full-Stack Developer & Software Engineer`,
      type: "website",
      url: `${BASE_URL}/`,
      image: DEFAULT_IMAGE,
      site_name: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${SITE_NAME} | Full-Stack Developer & Software Engineer`,
      image: DEFAULT_IMAGE,
      creator: TWITTER_HANDLE,
    },
  },
  {
    page: "about",
    path: "/about",
    title: `About ${SITE_NAME} | Software Engineer & Tech Enthusiast`,
    description:
      "Learn more about Heykyy—a software engineer specializing in scalable architecture, performance optimization, and modern web technologies.",
    canonical: `${BASE_URL}/about`,
    robots: "index, follow",
    og: {
      title: `About ${SITE_NAME} | Software Engineer`,
      type: "profile",
      url: `${BASE_URL}/about`,
      image: DEFAULT_IMAGE,
      site_name: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `About ${SITE_NAME} | Software Engineer`,
      image: DEFAULT_IMAGE,
      creator: TWITTER_HANDLE,
    },
  },
  {
    page: "blog",
    path: "/blog",
    title: `Tech Blog | ${SITE_NAME}`,
    description:
      "Insights on software engineering, system design, and cutting-edge tech trends by Heykyy.",
    canonical: `${BASE_URL}/blog`,
    robots: "index, follow",
    og: {
      title: `Tech Blog | ${SITE_NAME}`,
      type: "website",
      url: `${BASE_URL}/blog`,
      image: DEFAULT_IMAGE,
      site_name: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `Tech Blog | ${SITE_NAME}`,
      image: DEFAULT_IMAGE,
      creator: TWITTER_HANDLE,
    },
  },
  {
    page: "projects",
    path: "/projects",
    title: `Projects Portfolio | ${SITE_NAME}`,
    description:
      "Explore Heykyy's portfolio showcasing full-stack projects with real-world impact and innovative solutions.",
    canonical: `${BASE_URL}/projects`,
    robots: "index, follow",
    og: {
      title: `Projects Portfolio | ${SITE_NAME}`,
      type: "website",
      url: `${BASE_URL}/projects`,
      image: DEFAULT_IMAGE,
      site_name: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `Projects Portfolio | ${SITE_NAME}`,
      image: DEFAULT_IMAGE,
      creator: TWITTER_HANDLE,
    },
  },
  {
    page: "privacy",
    path: "/privacy",
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
      "Understand how Heykyy handles your data and protects your privacy on this portfolio site.",
    canonical: `${BASE_URL}/privacy`,
    robots: "index, follow",
    og: {
      title: `Privacy Policy | ${SITE_NAME}`,
      type: "website",
      url: `${BASE_URL}/privacy`,
      image: DEFAULT_IMAGE,
      site_name: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `Privacy Policy | ${SITE_NAME}`,
      image: DEFAULT_IMAGE,
      creator: TWITTER_HANDLE,
    },
  },
  {
    page: "terms",
    path: "/terms",
    title: `Terms of Service | ${SITE_NAME}`,
    description:
      "Learn the rules and limitations for using Heykyy's portfolio website.",
    canonical: `${BASE_URL}/terms`,
    robots: "index, follow",
    og: {
      title: `Terms of Service | ${SITE_NAME}`,
      type: "website",
      url: `${BASE_URL}/terms`,
      image: DEFAULT_IMAGE,
      site_name: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `Terms of Service | ${SITE_NAME}`,
      image: DEFAULT_IMAGE,
      creator: TWITTER_HANDLE,
    },
  },
  {
    page: "guidelines",
    path: "/guidelines",
    title: `Community Guidelines | ${SITE_NAME}`,
    description:
      "Best practices and rules for interacting with Heykyy's blog posts, projects, and discussions.",
    canonical: `${BASE_URL}/guidelines`,
    robots: "index, follow",
    og: {
      title: `Community Guidelines | ${SITE_NAME}`,
      type: "website",
      url: `${BASE_URL}/guidelines`,
      image: DEFAULT_IMAGE,
      site_name: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `Community Guidelines | ${SITE_NAME}`,
      image: DEFAULT_IMAGE,
      creator: TWITTER_HANDLE,
    },
  },
];

export default SEO;