/**
 * @fileoverview Komponen halaman Terms of Service.
 * Merender konten syarat dan ketentuan menggunakan arsitektur layout standar 
 * seperti Container dan Stack, serta komponen BaseCard untuk daftar item.
 * Terintegrasi dengan React Helmet untuk injeksi metadata SEO.
 */

import React, { useMemo } from "react";
import { Helmet } from "react-helmet";
import { Stack, Container, Typography, Box } from "@mui/material";
import { BaseCard } from "@ui/card";
import SEO from "@data/seo";
import TermsMock from "@mock/terms-mock";

/**
 * Komponen utama untuk halaman Terms of Service.
 *
 * @component
 * @returns {JSX.Element} Halaman Terms of Service yang sudah dirakit secara utuh.
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

      <Container maxWidth="lg">
        <Stack direction="column" alignItems="stretch" spacing={4}>
          <Box sx={{ textAlign: "left", mb: 1 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Terms of Service
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700 }}>
              Please read these terms and conditions carefully before using this portfolio website.
            </Typography>
          </Box>

          <Stack direction="column" spacing={2}>
            {TermsMock.map((item, index) => (
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

export default Terms;