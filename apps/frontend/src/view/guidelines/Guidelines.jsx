/**
 * @fileoverview Komponen halaman Community Guidelines.
 * Merender konten panduan komunitas menggunakan arsitektur layout standar 
 * seperti Container dan Stack, serta komponen BaseCard untuk daftar item.
 * Terintegrasi dengan React Helmet untuk injeksi metadata SEO.
 */

import React, { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Stack, Container, Typography, Box } from "@mui/material";
import { BaseCard } from "@ui/card";
import GuidelinesMock from "@mock/guidelines-mock";
import SEO from "@data/seo";

/**
 * Komponen utama untuk halaman Community Guidelines.
 *
 * @component
 * @returns {JSX.Element} Halaman Community Guidelines yang sudah dirakit secara utuh.
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

      <Container maxWidth="lg">
        <Stack direction="column" alignItems="stretch" spacing={4}>
          <Box sx={{ textAlign: "left", mb: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Community Guidelines
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
              Please read and follow these rules to maintain a respectful and safe environment for everyone.
            </Typography>
          </Box>

          <Stack direction="column" spacing={2}>
            {GuidelinesMock.map((item, index) => (
              <BaseCard 
                key={index} 
                title={item.heading} 
                subtitle={item.content} 
                icon={item.icon ? <item.icon size={24} /> : null} 
              />
            ))}
          </Stack>
        </Stack>
      </Container>
    </>
  );
};

export default Guidelines;