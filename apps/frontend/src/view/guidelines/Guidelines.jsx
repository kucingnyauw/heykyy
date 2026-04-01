import React, { useMemo, memo } from "react";
import { Helmet } from "react-helmet";
import { Typography, Box } from "@mui/material";
import { AppFlexLayout, AppBasicCard } from "@heykyy/components";

import GuidelinesMock from "../../mock/guidelines-mock";
import SEO from "../../data/seo";

/**
 * Komponen halaman Guidelines / Rules untuk blog/forum portfolio.
 * @returns {JSX.Element}
 */
const Guidelines = () => {
  const guidelinesSEO = useMemo(
    () => SEO.find((item) => item.page === "guidelines"),
    []
  );

  return (
    <>
      <Helmet>
        <title>{guidelinesSEO?.title}</title>
        {guidelinesSEO?.description && (
          <meta name="description" content={guidelinesSEO.description} />
        )}
        {guidelinesSEO?.robots && (
          <meta name="robots" content={guidelinesSEO.robots} />
        )}
        {guidelinesSEO?.canonical && (
          <link rel="canonical" href={guidelinesSEO.canonical} />
        )}

        {/* Open Graph */}
        {guidelinesSEO?.og?.title && (
          <meta property="og:title" content={guidelinesSEO.og.title} />
        )}
        {guidelinesSEO?.og?.description && (
          <meta property="og:description" content={guidelinesSEO.og.description} />
        )}
        {guidelinesSEO?.og?.type && (
          <meta property="og:type" content={guidelinesSEO.og.type} />
        )}
        {guidelinesSEO?.og?.url && (
          <meta property="og:url" content={guidelinesSEO.og.url} />
        )}
        {guidelinesSEO?.og?.image && (
          <meta property="og:image" content={guidelinesSEO.og.image} />
        )}
        {guidelinesSEO?.og?.site_name && (
          <meta property="og:site_name" content={guidelinesSEO.og.site_name} />
        )}

        {/* Twitter */}
        {guidelinesSEO?.twitter?.card && (
          <meta name="twitter:card" content={guidelinesSEO.twitter.card} />
        )}
        {guidelinesSEO?.twitter?.title && (
          <meta name="twitter:title" content={guidelinesSEO.twitter.title} />
        )}
        {guidelinesSEO?.twitter?.description && (
          <meta
            name="twitter:description"
            content={guidelinesSEO.twitter.description}
          />
        )}
        {guidelinesSEO?.twitter?.image && (
          <meta name="twitter:image" content={guidelinesSEO.twitter.image} />
        )}
        {guidelinesSEO?.twitter?.creator && (
          <meta name="twitter:creator" content={guidelinesSEO.twitter.creator} />
        )}
      </Helmet>

      <AppFlexLayout direction="column" align="flex-start" gap={2}>
        {/* Title & Subtitle Wrapper */}
        <Box sx={{ textAlign: "left", mb: 1 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Community Guidelines
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please read and follow these rules to maintain a respectful and safe environment for everyone.
          </Typography>
        </Box>

        {/* Guidelines List */}
        {GuidelinesMock.map((item, index) => (
          <AppBasicCard 
            key={index} 
            title={item.heading} 
            subtitle={item.content} 
            icon={<item.icon />} 
          />
        ))}
      </AppFlexLayout>
    </>
  );
};

export default memo(Guidelines);