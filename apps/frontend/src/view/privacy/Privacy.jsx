import React, { useMemo, memo } from "react";
import { Helmet } from "react-helmet";
import { Typography, Box } from "@mui/material";
import { AppFlexLayout, AppBasicCard } from "@heykyy/components";

import PrivacyPolicyMock from "../../mock/privacy-mock";
import SEO from "../../data/seo";

/**
 * Komponen halaman Privacy Policy.
 * @returns {JSX.Element}
 */
const Privacy = () => {
  const privacySEO = useMemo(
    () => SEO.find((item) => item.page === "privacy"),
    []
  );

  return (
    <>
      <Helmet>
        <title>{privacySEO?.title}</title>
        {privacySEO?.description && (
          <meta name="description" content={privacySEO.description} />
        )}
        {privacySEO?.robots && (
          <meta name="robots" content={privacySEO.robots} />
        )}
        {privacySEO?.canonical && (
          <link rel="canonical" href={privacySEO.canonical} />
        )}

        {/* Open Graph */}
        {privacySEO?.og?.title && (
          <meta property="og:title" content={privacySEO.og.title} />
        )}
        {privacySEO?.og?.description && (
          <meta property="og:description" content={privacySEO.og.description} />
        )}
        {privacySEO?.og?.type && (
          <meta property="og:type" content={privacySEO.og.type} />
        )}
        {privacySEO?.og?.url && (
          <meta property="og:url" content={privacySEO.og.url} />
        )}
        {privacySEO?.og?.image && (
          <meta property="og:image" content={privacySEO.og.image} />
        )}
        {privacySEO?.og?.site_name && (
          <meta property="og:site_name" content={privacySEO.og.site_name} />
        )}

        {/* Twitter */}
        {privacySEO?.twitter?.card && (
          <meta name="twitter:card" content={privacySEO.twitter.card} />
        )}
        {privacySEO?.twitter?.title && (
          <meta name="twitter:title" content={privacySEO.twitter.title} />
        )}
        {privacySEO?.twitter?.description && (
          <meta
            name="twitter:description"
            content={privacySEO.twitter.description}
          />
        )}
        {privacySEO?.twitter?.image && (
          <meta name="twitter:image" content={privacySEO.twitter.image} />
        )}
        {privacySEO?.twitter?.creator && (
          <meta name="twitter:creator" content={privacySEO.twitter.creator} />
        )}
      </Helmet>

      <AppFlexLayout direction="column" align="flex-start" gap={2}>
        {/* Title & Subtitle Wrapper */}
        <Box sx={{ textAlign: "left", mb: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Learn how we handle, collect, and protect your personal information when you use this portfolio site.
          </Typography>
        </Box>

        {/* Privacy Policy List */}
        {PrivacyPolicyMock.map((item, index) => (
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

export default memo(Privacy);