/**
 * @fileoverview Certifications section component for the About page.
 * Displays achievements in a responsive grid layout with pagination and interactive preview dialogs.
 */

import React, { memo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  alpha,
  useTheme,
  Chip,
  Paper,
  Skeleton,
} from "@mui/material";
import { motion } from "framer-motion";
import { Award, Briefcase, FileText, Download } from "lucide-react";

import {
  AppFlexLayout,
  AppGridLayout,
  AppSectionLayout,
  AppBasicCard,
  AppDialog,
  IconButton,
  AppPagination,
} from "@heykyy/components";
import { getCertification } from "../../../service/certificate-service";
import GridPlusDeco from "../../../ui-components/GridPlusDeco";
import AboutData from "../../../data/about";
import { SectionHeader, fadeInVariant } from "./AboutShared";

/**
 * Renders the certifications grid. Handles API fetching, skeleton loading states,
 * page-based navigation, and mounting an AppDialog to view certificate details.
 * * @returns {JSX.Element|null} The populated certifications grid or null if empty.
 */
const CertificationsSection = memo(() => {
  const theme = useTheme();
  const config = AboutData.certifications;

  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  const { data: certificatesData, isLoading: certLoading } = useQuery({
    queryKey: ["certificates-home", page],
    queryFn: () => getCertification(page, 8),
    staleTime: 300000,
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
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInVariant}
    >
      <AppSectionLayout sx={{ position: "relative" }}>
        <GridPlusDeco
          sx={{ top: "5%", left: "50%", transform: "translateX(-50%)" }}
        />
        <AppFlexLayout direction="column" gap={{ xs: 8, md: 10 }}>
          <SectionHeader {...config} />

          {certLoading ? (
            <AppGridLayout
              columns={{
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              }}
              gap={3}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <Box
                  key={i}
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
              ))}
            </AppGridLayout>
          ) : (
            <AppGridLayout
              columns={{
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(4, 1fr)",
              }}
              gap={3}
            >
              {certificatesData.data.map((cert) => (
                <AppBasicCard
                  key={cert.id}
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
              ))}
            </AppGridLayout>
          )}

          {!certLoading && totalPages > 1 && (
            <AppFlexLayout justify="center">
              <AppPagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
              />
            </AppFlexLayout>
          )}
        </AppFlexLayout>

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
              <AppFlexLayout
                direction="column"
                align="center"
                gap={2}
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

                <AppFlexLayout direction="column" gap={1} align="center">
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
                </AppFlexLayout>
              </AppFlexLayout>

              <AppFlexLayout
                direction="column"
                align="stretch"
                gap={3}
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
                  <AppFlexLayout align="center" gap={2}>
                    <Briefcase size={20} color={theme.palette.primary.main} />
                    <AppFlexLayout
                      direction="column"
                      gap={0}
                      sx={{ overflow: "hidden", alignItems: "flex-start" }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Issuer
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {selectedCert.issuer || "-"}
                      </Typography>
                    </AppFlexLayout>
                  </AppFlexLayout>
                </Paper>

                {selectedCert.summary && (
                  <AppFlexLayout direction="column" gap={1} align="stretch">
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
                  </AppFlexLayout>
                )}

                {selectedCert?.image?.url && (
                  <AppFlexLayout direction="column" gap={1.5} align="stretch">
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
                  </AppFlexLayout>
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
                    <AppFlexLayout gap={2}>
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
                      <AppFlexLayout
                        direction="column"
                        gap={0}
                        align="flex-start"
                      >
                        <Typography variant="body2" fontWeight="bold">
                          Document PDF
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ready to view / download
                        </Typography>
                      </AppFlexLayout>
                    </AppFlexLayout>
                    <IconButton
                      size="medium"
                      icon={<Download size={20} />}
                      sx={{
                        borderRadius : theme.shape.borderRadius ,
                      }}
                      onClick={() =>
                        window.open(selectedCert.file.url, "_blank")
                      }
                    />
                  </Paper>
                )}
              </AppFlexLayout>
            </Box>
          )}
        </AppDialog>
      </AppSectionLayout>
    </motion.div>
  );
});

export default memo(CertificationsSection);
