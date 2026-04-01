/**
 * @fileoverview Main container for the portfolio's About page.
 * Aggregates various personal sections (Hero, Education, Certifications)
 * and handles dynamic SEO metadata injection.
 */

import React, { useMemo, memo } from "react";
import { Helmet } from "react-helmet";
import { AppFlexLayout } from "@heykyy/components";

import SEO from "../../data/seo";
import { Asteroids } from "./components/AboutShared";
import HeroSection from "./components/HeroSection";
import EducationSection from "./components/EducationSection";
import CertificationsSection from "./components/CertificationsSection";

/**
 * Orchestrates the full layout of the About view.
 * Embeds React Helmet to dynamically update the document head with Open Graph and Twitter card data.
 * Stacks child sections vertically using the centralized AppFlexLayout system.
 * * @returns {JSX.Element} The fully assembled About page.
 */
const About = () => {
  const aboutSEO = useMemo(() => SEO.find((item) => item.page === "about"), []);

  return (
    <>
      <Helmet>
        <title>{aboutSEO?.title}</title>

        {/* Basic SEO */}
        {aboutSEO?.description && (
          <meta name="description" content={aboutSEO.description} />
        )}
        {aboutSEO?.robots && <meta name="robots" content={aboutSEO.robots} />}
        {aboutSEO?.canonical && (
          <link rel="canonical" href={aboutSEO.canonical} />
        )}

        {/* Open Graph */}
        {aboutSEO?.og?.title && (
          <meta property="og:title" content={aboutSEO.og.title} />
        )}
        {aboutSEO?.og?.description && (
          <meta property="og:description" content={aboutSEO.og.description} />
        )}
        {aboutSEO?.og?.type && (
          <meta property="og:type" content={aboutSEO.og.type} />
        )}
        {aboutSEO?.og?.url && (
          <meta property="og:url" content={aboutSEO.og.url} />
        )}
        {aboutSEO?.og?.image && (
          <meta property="og:image" content={aboutSEO.og.image} />
        )}
        {aboutSEO?.og?.site_name && (
          <meta property="og:site_name" content={aboutSEO.og.site_name} />
        )}

        {/* Twitter */}
        {aboutSEO?.twitter?.card && (
          <meta name="twitter:card" content={aboutSEO.twitter.card} />
        )}
        {aboutSEO?.twitter?.title && (
          <meta name="twitter:title" content={aboutSEO.twitter.title} />
        )}
        {aboutSEO?.twitter?.description && (
          <meta
            name="twitter:description"
            content={aboutSEO.twitter.description}
          />
        )}
        {aboutSEO?.twitter?.image && (
          <meta name="twitter:image" content={aboutSEO.twitter.image} />
        )}
        {aboutSEO?.twitter?.creator && (
          <meta name="twitter:creator" content={aboutSEO.twitter.creator} />
        )}
      </Helmet>

      {/* Decorative background for dark mode */}
      <Asteroids />

      <AppFlexLayout direction="column" gap={{ xs: 8, md: 14 }}>
        <HeroSection />
        <EducationSection />
        <CertificationsSection />
      </AppFlexLayout>
    </>
  );
};

export default memo(About);
