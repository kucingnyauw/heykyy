/**
 * @fileoverview Main orchestration file for the Portfolio Homepage.
 * Integrates dynamic SEO configurations, global background effects, 
 * and maps through the section definitions to render the layout sequentially.
 */

import React, { useMemo, memo } from "react";
import { Helmet } from "react-helmet";
import { AppFlexLayout } from "@heykyy/components";

import SEO from "../../data/seo";
import { Stars, Moon } from "./components/BackgroundEffects";
import SectionRenderer from "./components/SectionRenderer";

/**
 * The root component for the Homepage route.
 * Handles the mapping of declarative section keys into fully rendered React components
 * and ensures the correct metadata is pushed to the document head via React Helmet.
 * * @returns {JSX.Element} The assembled homepage layout.
 */
const Homepage = () => {
  const sectionKeys = useMemo(
    () => [
      "hero",
      "tech",
      "offerings",
      "projects",
      "blogs",
      "services",
      "testimonials",
      "cta",
    ],
    []
  );

  const homeSEO = useMemo(() => SEO.find((item) => item.page === "home"), []);

  return (
    <>
      <Helmet>
        <title>{homeSEO?.title}</title>

        {/* Basic SEO */}
        {homeSEO?.description && (
          <meta name="description" content={homeSEO.description} />
        )}
        {homeSEO?.robots && <meta name="robots" content={homeSEO.robots} />}
        {homeSEO?.canonical && (
          <link rel="canonical" href={homeSEO.canonical} />
        )}

        {/* Open Graph */}
        {homeSEO?.og?.title && (
          <meta property="og:title" content={homeSEO.og.title} />
        )}
        {homeSEO?.og?.description && (
          <meta property="og:description" content={homeSEO.og.description} />
        )}
        {homeSEO?.og?.type && (
          <meta property="og:type" content={homeSEO.og.type} />
        )}
        {homeSEO?.og?.url && (
          <meta property="og:url" content={homeSEO.og.url} />
        )}
        {homeSEO?.og?.image && (
          <meta property="og:image" content={homeSEO.og.image} />
        )}
        {homeSEO?.og?.site_name && (
          <meta property="og:site_name" content={homeSEO.og.site_name} />
        )}

        {/* Twitter */}
        {homeSEO?.twitter?.card && (
          <meta name="twitter:card" content={homeSEO.twitter.card} />
        )}
        {homeSEO?.twitter?.title && (
          <meta name="twitter:title" content={homeSEO.twitter.title} />
        )}
        {homeSEO?.twitter?.description && (
          <meta
            name="twitter:description"
            content={homeSEO.twitter.description}
          />
        )}
        {homeSEO?.twitter?.image && (
          <meta name="twitter:image" content={homeSEO.twitter.image} />
        )}
        {homeSEO?.twitter?.creator && (
          <meta name="twitter:creator" content={homeSEO.twitter.creator} />
        )}
      </Helmet>

      {/* Ambient background animations */}
      <Stars />
      <Moon />

      <AppFlexLayout direction="column" gap={{ xs: 8, md: 14 }}>
        {sectionKeys.map((key) => (
          <SectionRenderer key={key} sectionKey={key} />
        ))}
      </AppFlexLayout>
    </>
  );
};

export default memo(Homepage);