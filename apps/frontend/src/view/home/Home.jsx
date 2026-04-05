/**
 * @fileoverview Komponen utama untuk halaman Beranda (Homepage) Portfolio.
 * Menggunakan Material UI (Stack, Container, Grid2) untuk layouting,
 * React Query untuk data fetching, dan Framer Motion untuk animasi.
 */

import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Masonry from "@mui/lab/Masonry";
import StackIcon from "tech-stack-icons";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  Container,
  Stack,
  Grid,
} from "@mui/material";

import { FilledButton, OutlinedButton, AppSnackBar } from "@heykyy/components";

import {
  ReviewCard,
  ProjectCard,
  BlogCard,
  ServiceCard,
  BaseCard,
} from "@ui/card";
import { ProjectSkeleton, BlogSkeleton } from "@ui/skeleton";
import { SectionTag, SectionHeader } from "@ui/section";
import { StarsFall, Moon } from "@ui/background";
import {
  DotGridDeco,
  GridPlusDeco,
  CrossDeco,
  HashDashedDeco,
  BoxDeco,
  HashGlowDeco,
} from "@ui/decoration";

import { STALE_TIME } from "@heykyy/constant";
import { useDevice } from "@hooks/use-device";
import { useAppTheme } from "@hooks/use-app-theme";
import { buildWhatsAppLink } from "@utils/wa";

import { getCvs } from "@api/cv-api";
import { getFeaturedProjects } from "@api/project-api";
import { getFeaturedBlogs } from "@api/blogs-api";

import {  smoothRunning } from "@styles/animation";

import OfferingMock from "@mock/offering-mock";
import TechMock from "@mock/tech-mock";
import ServiceMock from "@mock/services-mock";
import ReviewMock from "@mock/review-mock";
import SEO from "@data/seo";
import HomeData from "@data/home";
import INFO from "@data/info";
import AnimatedSection from "@ui/section/SectionAnimated";

/**
 * Komponen pembungkus untuk memberikan efek animasi fade-in saat elemen masuk viewport.
 * * @param {Object} props - Properti komponen.
 * @param {React.ReactNode} props.children - Elemen anak yang akan dianimasikan.
 * @returns {JSX.Element} Motion div dengan animasi fade in.
 */


/**
 * Bagian Hero (Sambutan Utama) dari halaman Beranda.
 * Menampilkan judul, subjudul, dan tombol Call to Action (Lihat CV & Kontak).
 * * @returns {JSX.Element} Komponen Hero Section.
 */
const HeroSection = () => {
  const theme = useTheme();
  const { isMobile } = useDevice();
  const config = HomeData.hero;

  const [snackbarInfo, setSnackbarInfo] = useState({
    open: false,
    message: "",
    variant: "info",
  });

  const { data: cvsData, isLoading: isCvsLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: getCvs,
    staleTime: STALE_TIME,
  });

  /**
   * Fungsi untuk menangani aksi klik pada tombol "View Resume".
   * Akan mengambil data CV dan membuka URL file di tab baru.
   */
  const handleViewResume = useCallback(() => {
    if (isCvsLoading) {
      setSnackbarInfo({
        open: true,
        message: "Please wait, preparing your resume...",
        variant: "info",
      });
      return;
    }
    const data = cvsData?.data || cvsData;
    const cv = Array.isArray(data)
      ? data.find((c) => c.isMain) || data[0]
      : data;

    if (cv?.file?.url) {
      window.open(cv.file.url, "_blank");
    } else {
      setSnackbarInfo({
        open: true,
        message: "CV not found. Please check back later.",
        variant: "error",
      });
    }
  }, [cvsData, isCvsLoading]);

  return (
    <AnimatedSection>
      <Container
        maxWidth="xl"
        sx={{ position: "relative", textAlign: "center" }}
      >
        <Stack
          direction="column"
          spacing={{ xs: 4, md: 8 }}
          alignItems="center"
        >
          <SectionTag label={config.label} icon={config.icon} />
          <Stack direction="column" spacing={2} alignItems="center">
            <Typography
              variant={isMobile ? "h3" : "h1"}
              sx={{
                fontWeight: 400,
                lineHeight: 1.4,
                maxWidth: { xs: 960, md: 880 },
                background: `linear-gradient(135deg, ${
                  theme.palette.text.primary
                } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {config.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: { xs: 600, md: 720 },
              }}
            >
              {config.subTitle}
            </Typography>
          </Stack>

          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={{ xs: 2, sm: 4 }}
            alignItems="center"
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <FilledButton
              size="medium"
              sx={{ minWidth: 140 }}
              onClick={handleViewResume}
            >
              View Resume
            </FilledButton>
            <OutlinedButton
              size="medium"
              sx={{ minWidth: 140 }}
              onClick={() => window.open(buildWhatsAppLink(), "_blank")}
            >
              Contact Me
            </OutlinedButton>
          </Stack>
        </Stack>
      </Container>

      <AppSnackBar
        open={snackbarInfo.open}
        message={snackbarInfo.message}
        variant={snackbarInfo.variant}
        onClose={() => setSnackbarInfo((prev) => ({ ...prev, open: false }))}
      />
    </AnimatedSection>
  );
};

/**
 * Bagian Teknologi (Tech Stack).
 * Menampilkan ikon teknologi yang dikuasai dengan efek animasi scrolling (marquee).
 * * @returns {JSX.Element} Komponen Tech Section.
 */
const TechSection = () => {
  const theme = useTheme();
  const config = HomeData.tech;

  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <Stack direction="column" spacing={{ xs: 8, md: 12 }}>
          <SectionHeader {...config} />
          <Box
            sx={{
              overflow: "hidden",
              width: "100%",
              position: "relative",
              maskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: { xs: 2, md: 4 },
                width: "max-content",
                animation: `${smoothRunning} 30s linear infinite`,
                willChange: "transform",
              }}
            >
              {[...TechMock, ...TechMock].map((item, index) => (
                <Box
                  key={`${item.name}-${index}`}
                  sx={{
                    width: { xs: 70, md: 80 },
                    height: { xs: 70, md: 80 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: { xs: 1, md: 1.5 },
                    transition: "transform 0.3s ease-in-out",
                    "&:hover": { transform: "scale(1.1)" },
                  }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      filter:
                        theme.palette.mode === "dark" ? "grayscale(1)" : "none",
                      opacity: theme.palette.mode === "light" ? 1 : 0.6,
                    }}
                  >
                    <StackIcon
                      name={item.iconName}
                      style={{
                        width: "50%",
                        height: "50%",
                        color: theme.palette.text.primary,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Offerings (Penawaran Nilai).
 * Menampilkan kartu informasi tentang apa saja yang ditawarkan (keahlian utama).
 * * @returns {JSX.Element} Komponen Offerings Section.
 */
const OfferingsSection = () => {
  const config = HomeData.offerings;
  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <GridPlusDeco
          sx={{ top: "10%", left: "50%", transform: "translateX(-50%)" }}
        />
        <Stack direction="column" spacing={{ xs: 8, md: 12 }}>
          <SectionHeader {...config} />
          <Grid container spacing={4}>
            {OfferingMock.map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.title}>
                <BaseCard
                  icon={<item.icon size={24} />}
                  title={item.title}
                  subtitle={item.description}
                  sx={{ minHeight: 160 }}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Proyek Unggulan (Featured Projects).
 * Mengambil dan menampilkan daftar proyek unggulan dari API.
 * * @returns {JSX.Element|null} Komponen Projects Section atau null jika tidak ada data.
 */
const ProjectsSection = () => {
  const config = HomeData.projects;
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ["featured-projects"],
    queryFn: getFeaturedProjects,
    staleTime: STALE_TIME,
  });

  if (!isLoading && (!projectsData || projectsData.length === 0)) return null;

  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <BoxDeco />
        <Stack direction="column" spacing={{ xs: 8, md: 12 }}>
          <SectionHeader {...config} />
          <Grid container spacing={4}>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <Grid size={{ xs: 12, md: 4 }} key={i}>
                    <ProjectSkeleton />
                  </Grid>
                ))
              : projectsData.map((project) => (
                  <Grid size={{ xs: 12, md: 4 }} key={project.id}>
                    <ProjectCard
                      project={project}
                      onClick={(slug) =>
                        console.log(`Maps to /project/${slug}`)
                      }
                    />
                  </Grid>
                ))}
          </Grid>
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Blog Unggulan (Featured Blogs).
 * Mengambil dan menampilkan artikel/blog unggulan dari API.
 * * @returns {JSX.Element|null} Komponen Blogs Section atau null jika tidak ada data.
 */
const BlogsSection = () => {
  const config = HomeData.blogs;
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ["featured-blogs"],
    queryFn: getFeaturedBlogs,
    staleTime: STALE_TIME,
  });

  if (!isLoading && (!blogsData || blogsData.length === 0)) return null;

  return (
    <AnimatedSection>
      <Container
        maxWidth="xl"
        sx={{
          alignItems: "stretch",
          position: "relative",
        }}
      >
        <DotGridDeco sx={{ top: -20, left: "10%" }} />
        <Stack
          direction="column"
          spacing={{ xs: 4, md: 12 }}
          sx={{ width: "100%" }}
        >
          <SectionHeader {...config} />
          <Grid container spacing={4}>
            {isLoading
              ? [...Array(3)].map((_, i) => (
                  <Grid size={{ xs: 12, md: 4 }} key={i}>
                    <BlogSkeleton />
                  </Grid>
                ))
              : blogsData.map((blog) => (
                  <Grid size={{ xs: 12, md: 4 }} key={blog.id}>
                    <BlogCard
                      blog={blog}
                      onClick={(slug) => console.log(`Maps to /blogs/${slug}`)}
                    />
                  </Grid>
                ))}
          </Grid>
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Layanan (Services).
 * Menampilkan daftar layanan yang disediakan dengan tombol langsung menuju WhatsApp.
 * * @returns {JSX.Element} Komponen Services Section.
 */
const ServicesSection = () => {
  const config = HomeData.services;
  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <CrossDeco sx={{ top: "5%", left: "10%", transform: "scale(1.5)" }} />
        <CrossDeco
          sx={{
            top: { md: "30%", xs: "10%" },
            right: "10%",
            transform: "scale(1.5)",
          }}
        />
        <Stack direction="column" spacing={{ xs: 8, md: 12 }}>
          <SectionHeader {...config} />
          <Grid container spacing={4}>
            {ServiceMock.services.map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.title}>
                <ServiceCard
                  {...item}
                  onSelect={() => {
                    const msg = `Hi Rifky, I saw your portfolio and I'm very interested in your "${item.title}" service. Could we discuss this further?`;
                    window.open(buildWhatsAppLink(msg), "_blank");
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Testimoni (Testimonials).
 * Menampilkan ulasan klien dengan layout Masonry dan efek scrolling horizontal.
 * * @returns {JSX.Element} Komponen Testimonials Section.
 */
const TestimonialsSection = () => {
  const config = HomeData.testimonials;
  return (
    <AnimatedSection>
      <Container
        maxWidth="xl"
        sx={{ position: "relative", overflow: "hidden" }}
      >
        <HashDashedDeco sx={{ top: 0, right: { xs: "-5%", md: 40 } }} />
        <Stack direction="column" spacing={{ xs: 8, md: 12 }}>
          <SectionHeader {...config} />
          <Box
            sx={{
              overflow: "hidden",
              width: "100%",
              position: "relative",
              maskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                width: "max-content",
                animation: `${smoothRunning} 60s linear infinite`,
                willChange: "transform",
                py: 1,
                "&:has(.masonry-item:hover)": { animationPlayState: "paused" },
              }}
            >
              {[1, 2].map((group) => (
                <Box
                  key={group}
                  sx={{
                    height: { xs: 290, md: 520 },
                    border: "1px solid black",
                    width: { xs: 900, md: 1100 },
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  <Masonry
                    columns={3}
                    spacing={2}
                    sx={{ m: 0, width: "100%", height: "100%" }}
                  >
                    {ReviewMock.map((item, index) => (
                      <Box
                        key={`${group}-${index}`}
                        className="masonry-item"
                        sx={{
                          display: "flex",
                          breakInside: "avoid",
                          transition: "transform 0.3s ease",
                          "&:hover": { transform: "scale(1.02)", zIndex: 10 },
                        }}
                      >
                        <ReviewCard
                          {...item}
                          rating={item.star}
                          sx={{
                            width: "100%",
                            height: "auto",
                            cursor: "pointer",
                          }}
                        />
                      </Box>
                    ))}
                  </Masonry>
                </Box>
              ))}
            </Box>
          </Box>
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Bagian Call to Action (CTA) di akhir halaman.
 * Mengajak pengunjung untuk menghubungi via WhatsApp.
 * * @returns {JSX.Element} Komponen CTA Section.
 */
const CtaSection = () => {
  const config = HomeData.cta;
  return (
    <AnimatedSection>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <HashGlowDeco
          sx={{
            top: "20%",
            left: "50%",
            transform: "translateX(-50%) scale(1.5)",
          }}
        />
        <Stack
          direction="column"
          alignItems="center"
          spacing={{ xs: 4, md: 6 }}
          sx={{ textAlign: "center" }}
        >
          <SectionHeader {...config} />
          <FilledButton
            size="medium"
            onClick={() =>
              window.open(
                buildWhatsAppLink(
                  INFO.main.phone,
                  "Hi Rifky, I visited your portfolio and I'm interested in discussing a potential project/collaboration with you. Let's get in touch!"
                ),
                "_blank"
              )
            }
          >
            Get in Touch
          </FilledButton>
        </Stack>
      </Container>
    </AnimatedSection>
  );
};

/**
 * Komponen Utama Halaman Beranda (Homepage).
 * Mengatur metadata SEO (Helmet) dan menggabungkan semua section menjadi satu halaman.
 * * @returns {JSX.Element} Halaman Beranda utuh.
 */
const Homepage = () => {
  const homeSEO = SEO.find((item) => item.page === "home");
  const { isDark } = useAppTheme();

  return (
    <>
      <Helmet>
        <title>{homeSEO?.title}</title>
        {homeSEO?.description && (
          <meta name="description" content={homeSEO.description} />
        )}
        {homeSEO?.robots && <meta name="robots" content={homeSEO.robots} />}
        {homeSEO?.canonical && (
          <link rel="canonical" href={homeSEO.canonical} />
        )}
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

      {isDark && (
        <>
          <StarsFall />
          <Moon />
        </>
      )}

      <Stack
        direction="column"
        spacing={{ xs: 14, md: 28 }}
        sx={{ mx: "auto", width: "100%", alignItems: "stretch" }}
      >
        <HeroSection />
        <TechSection />
        <OfferingsSection />
        <ProjectsSection />
        <BlogsSection />
        <ServicesSection />
        <TestimonialsSection />
        <CtaSection />
      </Stack>
    </>
  );
};

export default Homepage;