import React, { useMemo, memo } from "react";
import { Helmet } from "react-helmet";
import { Typography, Box } from "@mui/material";
import { AppFlexLayout, AppBasicCard } from "@heykyy/components";

import TermsMock from "../../mock/terms-mock";
import SEO from "../../data/seo";

/**
 * Komponen halaman Terms of Service.
 * @returns {JSX.Element}
 */
const Terms = () => {
  const termsSEO = useMemo(
    () => SEO.find((item) => item.page === "terms"),
    []
  );

  return (
    <>
      <Helmet>
        <title>{termsSEO?.title}</title>
        {termsSEO?.description && (
          <meta name="description" content={termsSEO.description} />
        )}
        {termsSEO?.robots && (
          <meta name="robots" content={termsSEO.robots} />
        )}
        {termsSEO?.canonical && (
          <link rel="canonical" href={termsSEO.canonical} />
        )}

        {/* Open Graph */}
        {termsSEO?.og?.title && (
          <meta property="og:title" content={termsSEO.og.title} />
        )}
        {termsSEO?.og?.description && (
          <meta property="og:description" content={termsSEO.og.description} />
        )}
        {termsSEO?.og?.type && (
          <meta property="og:type" content={termsSEO.og.type} />
        )}
        {termsSEO?.og?.url && (
          <meta property="og:url" content={termsSEO.og.url} />
        )}
        {termsSEO?.og?.image && (
          <meta property="og:image" content={termsSEO.og.image} />
        )}
        {termsSEO?.og?.site_name && (
          <meta property="og:site_name" content={termsSEO.og.site_name} />
        )}

        {/* Twitter */}
        {termsSEO?.twitter?.card && (
          <meta name="twitter:card" content={termsSEO.twitter.card} />
        )}
        {termsSEO?.twitter?.title && (
          <meta name="twitter:title" content={termsSEO.twitter.title} />
        )}
        {termsSEO?.twitter?.description && (
          <meta
            name="twitter:description"
            content={termsSEO.twitter.description}
          />
        )}
        {termsSEO?.twitter?.image && (
          <meta name="twitter:image" content={termsSEO.twitter.image} />
        )}
        {termsSEO?.twitter?.creator && (
          <meta name="twitter:creator" content={termsSEO.twitter.creator} />
        )}
      </Helmet>

      <AppFlexLayout direction="column" align="flex-start" gap={2}>
        {/* Title & Subtitle Wrapper */}
        <Box sx={{ textAlign: "left", mb: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Terms of Service
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please read these terms and conditions carefully before using this portfolio website.
          </Typography>
        </Box>

        {/* Terms of Service List */}
        {TermsMock.map((item, index) => (
          <AppBasicCard 
            key={index} 
            title={item.heading} 
            subtitle={item.content} 
            icon={item.icon ? <item.icon /> : null} 
          />
        ))}
      </AppFlexLayout>
    </>
  );
};

export default memo(Terms);