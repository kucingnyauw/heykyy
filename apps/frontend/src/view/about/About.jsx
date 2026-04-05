/**
 * @fileoverview Komponen utama untuk halaman Tentang (About) Portfolio.
 * Menggabungkan Hero, Edukasi, dan Sertifikasi ke dalam satu file dengan arsitektur
 * yang selaras dengan Homepage (menggunakan Stack, Container, Grid2, dan AnimatedSection).
 */

import React, { useMemo, useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Award, Briefcase, FileText, Download } from "lucide-react";

import {
  Stack,
  Container,
  alpha,
  Grid,
  Box,
  Typography,
  useTheme,
  Chip,
  Paper,
  Skeleton,
} from "@mui/material";

import { IconButton, AppPagination, AppDialog } from "@heykyy/components";
import { CertificateCard, EducationCard } from "@ui/card";
import { EducationSkeleton } from "@ui/skeleton";
import VerticalTimeline from "@ui/timeline/VerticalTimeline";

import { GridPlusDeco } from "@ui/decoration";
import { SectionHeader } from "@ui/section";
import FloatingStat from "@ui/floating/FloatingStat";
import AnimatedSection from "@ui/section/SectionAnimated";

import INFO from "@data/info";
import AboutData from "@data/about";
import SEO from "@data/seo";

import { getEducations } from "@api/education-api";
import { getCertificates } from "@api/certificate-api";
import { getSocialIcon } from "@utils/socials";
import { useDevice } from "@hooks/use-device";
import { STALE_TIME } from "@heykyy/constant";

import avatar from "@assets/avatar.webp";



/**
 * Bagian Hero (Tentang Saya).
 */
const HeroSection = () => {
  const theme = useTheme();
  const { isMobile } = useDevice();
  const config = AboutData.hero;

  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <Grid container spacing={12} alignItems="center">
          {/* Text Content */}
          <Grid
            size={{ xs: 12, md: 7 }}
            sx={{ order: { xs: 2, md: 1 }, zIndex: 2 }}
          >
            <Stack
              direction="column"
              spacing={5}
              alignItems={{ xs: "center", md: "flex-start" }}
              sx={{ textAlign: { xs: "center", md: "left" } }}
            >
              <Typography
                variant={isMobile ? "h3" : "h1"}
                sx={{
                  fontWeight: 400,
                  lineHeight: 1.3,
                  background: `linear-gradient(135deg, ${
                    theme.palette.text.primary
                  } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.02em",
                }}
              >
                {config.title}
              </Typography>

              <Typography
                variant="body1"
                sx={{ color: "text.secondary", maxWidth: 600, lineHeight: 1.7 }}
              >
                {config.subTitle}
              </Typography>

              {/* Social Links */}
              <Stack direction="row" spacing={1.5} alignItems="center">
                {Object.entries(INFO.socials).map(([platform, url]) => (
                  <IconButton
                    size="medium"
                    key={platform}
                    icon={getSocialIcon(platform)}
                    onClick={() => window.open(url, "_blank")}
                    sx={{
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      bgcolor: alpha(theme.palette.background.default, 0.05),
                      transition: "all 0.3s ease",
                      borderRadius: theme.shape.borderRadius,
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        transform: "translateY(-3px)",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Stack>
          </Grid>

          {/* Avatar Area */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ order: { xs: 1, md: 2 } }}>
            <Stack
              direction="column"
              alignItems="center"
              sx={{ position: "relative", width: "100%" }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "100%",
                  maxWidth: { xs: 260, md: 360 },
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Box
                  component="img"
                  src={avatar}
                  alt="Hero Avatar"
                  sx={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    position: "relative",
                    zIndex: 1,
                    objectFit: "cover",
                    borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
                  }}
                />

                <FloatingStat
                  title="1.5"
                  subtitle="Years Experience"
                  top={{ md: "15%", xs: "5%" }}
                  left={{ md: "-25%", xs: "-5%" }}
                  delay={0}
                  yAnimate={[-10, 10, -10]}
                />
                <FloatingStat
                  title="5+"
                  subtitle="Projects Solved"
                  bottom={{ md: "15%", xs: "5%" }}
                  right={{ md: "-25%", xs: "-5%" }}
                  delay={1.5}
                  yAnimate={[10, -10, 10]}
                />
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Riwayat Edukasi.
 */
const EducationSection = () => {
  const theme = useTheme();
  const config = AboutData.education;

  const { data: educations, isLoading: eduLoading } = useQuery({
    queryKey: ["educations"],
    queryFn: getEducations,
    staleTime: STALE_TIME,
  });

  const formatYear = useCallback(
    (d) => (d ? new Date(d).getFullYear() : "Present"),
    []
  );

  if (!eduLoading && (!educations || educations.length === 0)) return null;

  const timelineItems = eduLoading
    ? Array.from({ length: 3 }).map((_, i) => ({ id: `skeleton-${i}` }))
    : (educations || []).slice(0, 3);

  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <GridPlusDeco
          sx={{ top: "5%", left: "50%", transform: "translateX(-50%)" }}
        />

        <Stack direction="column" spacing={{ xs: 8, md: 12 }}>
          <SectionHeader {...config} />

          <VerticalTimeline
            items={timelineItems}
            renderOpposite={(item, index, isMobile) => {
              if (eduLoading) {
                return (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: isMobile
                        ? "flex-start"
                        : index % 2 === 0
                        ? "flex-end"
                        : "flex-start",
                    }}
                  >
                    <Skeleton
                      width={120}
                      height={20}
                      sx={{ borderRadius: theme.shape.borderRadius }}
                    />
                  </Box>
                );
              }
              return (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 800,
                    fontSize: "0.85rem",
                    letterSpacing: 1,
                    color: alpha(theme.palette.text.primary, 0.4),
                    display: isMobile ? "none" : "block",
                    textAlign: isMobile
                      ? "left"
                      : index % 2 === 0
                      ? "right"
                      : "left",
                  }}
                >
                  {formatYear(item?.startYear)} — {formatYear(item?.endYear)}
                </Typography>
              );
            }}
            renderContent={(item) => {
              if (eduLoading) return <EducationSkeleton />;
              return <EducationCard education={item} />;
            }}
          />
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Sertifikasi.
 */
const CertificationsSection = () => {
  const theme = useTheme();
  const config = AboutData.certifications;

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const { data: certificatesData, isLoading: certLoading } = useQuery({
    queryKey: ["certificates-home", page],
    queryFn: () => getCertificates(page, 8),
    staleTime: STALE_TIME,
  });

  const handlePageChange = useCallback((event, value) => {
    setPage(value);
  }, []);

  if (
    !certLoading &&
    (!certificatesData?.data || certificatesData.data.length === 0)
  )
    return null;

  const totalPages = certificatesData?.metadata?.totalPages || 1;

  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <GridPlusDeco
          sx={{ top: "5%", left: "50%", transform: "translateX(-50%)" }}
        />

        <Stack direction="column" spacing={{ xs: 8, md: 10 }}>
          <SectionHeader {...config} />

          {certLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      p: 2.5,
                      borderRadius: theme.shape.borderRadius,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: "background.paper",
                      minHeight: 110,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.divider, 0.1),
                        flexShrink: 0,
                      }}
                    >
                      <Skeleton
                        variant="rounded"
                        width={24}
                        height={24}
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Skeleton variant="text" width="90%" height={24} />
                      <Skeleton variant="text" width="60%" height={20} />
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={3}>
              {certificatesData.data.map((cert) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={cert.id}>
                  <CertificateCard
                    certificate={cert}
                    icon={<Award size={24} />}
                    title={cert.title}
                    subtitle={cert.summary}
                    onClick={() => {
                      setSelectedCert(cert);
                      setOpen(true);
                    }}
                    sx={{
                      cursor: "pointer",
                      minHeight: 140,
                      minWidth: 320,
                      textOverflow: "ellipsis",
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          {!certLoading && totalPages > 1 && (
            <Stack alignItems="center">
              <AppPagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
              />
            </Stack>
          )}
        </Stack>

        {/* Premium Dialog Preview */}
        <AppDialog
          open={open}
          onClose={() => {
            setOpen(false);
            setTimeout(() => setSelectedCert(null), 300);
          }}
          maxWidth="sm"
          contentSx={{ p: 0 }}
          actions={[
            {
              label: "Close",
              variant: "outlined",
              onClick: () => {
                setOpen(false);
                setTimeout(() => setSelectedCert(null), 300);
              },
            },
          ]}
        >
          {selectedCert && (
            <Box>
              <Stack
                direction="column"
                alignItems="center"
                spacing={2}
                sx={{
                  background: `linear-gradient(180deg, ${alpha(
                    theme.palette.primary.main,
                    0.1
                  )} 0%, ${theme.palette.background.paper} 100%)`,
                  pt: 4,
                  pb: 3,
                  px: 3,
                  textAlign: "center",
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: theme.shape.borderRadius,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.palette.primary.main,
                  }}
                >
                  <Award size={28} />
                </Paper>

                <Stack direction="column" spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight="800">
                    {selectedCert.title}
                  </Typography>
                  {selectedCert.year && (
                    <Chip
                      label={selectedCert.year}
                      size="small"
                      variant="outlined"
                      sx={{ borderRadius: theme.shape.borderRadius }}
                    />
                  )}
                </Stack>
              </Stack>

              <Stack
                direction="column"
                alignItems="stretch"
                spacing={3}
                sx={{ px: 3, pb: 3, pt: 1 }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: theme.shape.borderRadius,
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Briefcase size={20} color={theme.palette.primary.main} />
                    <Stack
                      direction="column"
                      spacing={0}
                      sx={{ overflow: "hidden", alignItems: "flex-start" }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Issuer
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {selectedCert.issuer || "-"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>

                {selectedCert.summary && (
                  <Stack direction="column" spacing={1} alignItems="stretch">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Summary
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: theme.shape.borderRadius,
                        bgcolor: alpha(theme.palette.primary.main, 0.02),
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {selectedCert.summary}
                      </Typography>
                    </Paper>
                  </Stack>
                )}

                {selectedCert?.image?.url && (
                  <Stack direction="column" spacing={1.5} alignItems="stretch">
                    <Typography variant="subtitle2" fontWeight="bold">
                      Preview
                    </Typography>
                    <Box
                      component="img"
                      src={selectedCert.image.url}
                      sx={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "contain",
                        borderRadius: theme.shape.borderRadius,
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    />
                  </Stack>
                )}

                {selectedCert?.file?.url && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      borderRadius: theme.shape.borderRadius,
                    }}
                  >
                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: theme.shape.borderRadius,
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                        }}
                      >
                        <FileText size={18} />
                      </Box>
                      <Stack
                        direction="column"
                        spacing={0}
                        alignItems="flex-start"
                      >
                        <Typography variant="body2" fontWeight="bold">
                          Document PDF
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ready to view / download
                        </Typography>
                      </Stack>
                    </Stack>
                    <IconButton
                      size="medium"
                      icon={<Download size={20} />}
                      sx={{ borderRadius: theme.shape.borderRadius }}
                      onClick={() =>
                        window.open(selectedCert.file.url, "_blank")
                      }
                    />
                  </Paper>
                )}
              </Stack>
            </Box>
          )}
        </AppDialog>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Komponen Utama Halaman Tentang (About).
 */
const About = () => {
  const aboutSEO = useMemo(() => SEO.find((item) => item.page === "about"), []);

  return (
    <>
      <Helmet>
        <title>{aboutSEO?.title}</title>
        {aboutSEO?.description && (
          <meta name="description" content={aboutSEO.description} />
        )}
        {aboutSEO?.robots && <meta name="robots" content={aboutSEO.robots} />}
        {aboutSEO?.canonical && (
          <link rel="canonical" href={aboutSEO.canonical} />
        )}
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

      <Stack
        direction="column"
        spacing={{ xs: 14, md: 28 }}
        sx={{ mx: "auto", width: "100%", alignItems: "stretch" }}
      >
        <HeroSection />
        <EducationSection />
        <CertificationsSection />
      </Stack>
    </>
  );
};

export default About;
