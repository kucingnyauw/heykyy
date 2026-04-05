/**
 * @fileoverview Komponen halaman Privacy Policy.
 * Merender konten kebijakan privasi menggunakan arsitektur layout standar 
 * seperti Container dan Stack, serta komponen BaseCard untuk daftar item.
 * Terintegrasi dengan React Helmet untuk injeksi metadata SEO.
 */

import React, { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Stack, Container, Typography, Box } from "@mui/material";
import { BaseCard } from "@ui/card";
import SEO from "@data/seo";
import PrivacyPolicyMock from "@mock/privacy-mock";

/**
 * Komponen utama untuk halaman Privacy Policy.
 *
 * @component
 * @returns {JSX.Element} Halaman Privacy Policy yang sudah dirakit secara utuh.
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

      <Container maxWidth="lg">
        <Stack direction="column" alignItems="stretch" spacing={4}>
          <Box sx={{ textAlign: "left", mb: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Privacy Policy
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
              Learn how we handle, collect, and protect your personal information when you use this portfolio site.
            </Typography>
          </Box>

          <Stack direction="column" spacing={2}>
            {PrivacyPolicyMock.map((item, index) => (
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

export default Privacy;