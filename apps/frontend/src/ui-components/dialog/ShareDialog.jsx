/**
 * @fileoverview Komponen ShareDialog untuk membagikan tautan ke berbagai platform sosial media.
 * Dilengkapi dengan fitur salin tautan (copy to clipboard) dengan visual feedback dan snackbar.
 */

import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  useTheme,
  Box,
  Typography,
  alpha,
  InputAdornment,
  Stack,
} from "@mui/material";

import { AppDialog, AppInput, IconButton, AppSnackBar } from "@heykyy/components";
import { Copy, Check, X } from "lucide-react";

import { SHARE_PLATFORMS } from "@utils/share";
import { ClipboardUtils } from "@heykyy/utils";

/**
 * Komponen dialog untuk membagikan URL konten.
 *
 * @component
 * @param {Object} props - Properti komponen.
 * @param {boolean} props.open - Status visibilitas dialog.
 * @param {Function} props.onClose - Fungsi callback ketika dialog ditutup.
 * @param {string} [props.url] - URL khusus yang ingin dibagikan (default: URL halaman saat ini).
 * @param {string} [props.title] - Judul konten yang dibagikan.
 * @returns {JSX.Element} Tampilan dialog berbagi (share).
 */
const ShareDialog = ({ open, onClose, url, title }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [url]);

  const handleCopy = async () => {
    try {
      await ClipboardUtils.copyToClipboard(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <AppDialog
        open={open}
        onClose={onClose}
        maxWidth="xs"
        sx={{
          "& .MuiDialog-paper": {
            overflow: "hidden",
            bgcolor: theme.palette.background.paper,
            borderRadius: theme.shape.borderRadius,
            boxShadow: theme.shadows[10],
          },
        }}
        dialogTitle={
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ width: "100%", pt: 1, pb: 0, px: 1 }}
          >
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
  Share this content
</Typography>
            <IconButton
              size="medium"
              icon={<X size={20} />}
              onClick={onClose}
              sx={{
                borderRadius : "50%",
                color: "text.secondary",
                "&:hover": {
                  bgcolor: alpha(theme.palette.text.primary, 0.05),
                  color: "text.primary",
                },
              }}
            />
          </Stack>
        }
      >
        <Stack spacing={3} sx={{ p: 2, pt: 1, alignItems: "center" }}>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%",
            }}
          >
            {SHARE_PLATFORMS.slice(0, 8).map(
              ({ label, Button, Icon, color }) => (
                <Box
                  key={label}
                  sx={{
                    width: "25%",
                    display: "flex",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <Stack
                    component={Button}
                    url={shareUrl}
                    title={title}
                    alignItems="center"
                    spacing={1}
                    sx={{
                      cursor: "pointer",
                      border: "none",
                      background: "transparent",
                      p: 0,
                      textAlign: "center",
                      "&:hover .icon-wrapper": {
                        transform: "scale(1.08)",
                        bgcolor: alpha(
                          color || theme.palette.primary.main,
                          0.12
                        ),
                      },
                    }}
                  >
                    <Box
                      className="icon-wrapper"
                      sx={{
                        width: 52,
                        height: 52,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "16px",
                        bgcolor: alpha(theme.palette.text.primary, 0.03),
                        color: color || theme.palette.text.primary,
                        transition: "all 0.25s ease",
                      }}
                    >
                      <Icon size={24} round />
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 500,
                        color: "text.secondary",
                        textAlign: "center",
                      }}
                    >
                      {label}
                    </Typography>
                  </Stack>
                </Box>
              )
            )}
          </Box>

          <Box sx={{ width: "100%" }}>
            <AppInput
              value={shareUrl}
              readOnly
              fullWidth
              sx={{
                "& .MuiInputBase-root": {
                  bgcolor: alpha(theme.palette.text.primary, 0.04),
                  borderRadius: "14px",
                  pr: 0.75,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "& .MuiInputBase-input": {
                  color: theme.palette.text.secondary,
                  fontSize: "0.85rem",
                  py: 1.5,
                  pl: 2,
                },
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleCopy}
                    icon={copied ? <Check size={18} /> : <Copy size={18} />}
                    sx={{
                      width: 36,
                      height: 36,
                      color: copied
                        ? theme.palette.success.main
                        : theme.palette.text.primary,
                      bgcolor: copied
                        ? alpha(theme.palette.success.main, 0.1)
                        : theme.palette.background.paper,
                      boxShadow: copied
                        ? "none"
                        : `0 2px 6px ${alpha(
                            theme.palette.common.black,
                            0.08
                          )}`,
                      borderRadius: "10px",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  />
                </InputAdornment>
              }
            />
          </Box>
        </Stack>
      </AppDialog>

      <AppSnackBar
        open={copied}
        message="Link berhasil disalin!"
        variant="success"
        onClose={() => setCopied(false)}
      />
    </>
  );
};

ShareDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  url: PropTypes.string,
  title: PropTypes.string,
};

export default ShareDialog;