import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import {
  useMediaQuery,
  useTheme,
  Box,
  Typography,
  alpha,
  InputAdornment,
} from "@mui/material";

import {
  FacebookShareButton,
  EmailShareButton,
  TelegramShareButton,
  RedditShareButton,
  ThreadsShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  TelegramIcon,
  RedditIcon,
  ThreadsIcon,
  EmailIcon,
} from "react-share";

import {
  AppDialog,
  AppInput,
  IconButton,
  AppFlexLayout,
  AppGridLayout,
} from "@heykyy/components";
import { Copy, Check, X, Share2 } from "lucide-react";

const SHARE_PLATFORMS = [
  {
    label: "WhatsApp",
    Button: WhatsappShareButton,
    Icon: WhatsappIcon,
    color: "#25D366",
  },
  {
    label: "X",
    Button: TwitterShareButton,
    Icon: TwitterIcon,
    color: "#000000",
  },
  {
    label: "Telegram",
    Button: TelegramShareButton,
    Icon: TelegramIcon,
    color: "#0088cc",
  },
  {
    label: "Facebook",
    Button: FacebookShareButton,
    Icon: FacebookIcon,
    color: "#1877F2",
  },
  {
    label: "LinkedIn",
    Button: LinkedinShareButton,
    Icon: LinkedinIcon,
    color: "#0A66C2",
  },
  {
    label: "Threads",
    Button: ThreadsShareButton,
    Icon: ThreadsIcon,
    color: "#000000",
  },
  {
    label: "Reddit",
    Button: RedditShareButton,
    Icon: RedditIcon,
    color: "#FF4500",
  },
  {
    label: "Email",
    Button: EmailShareButton,
    Icon: EmailIcon,
    color: "#7D7D7D",
  },
];

const ShareDialog = ({ open, onClose, url, title = "Check this out" }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (url) return url;
    if (typeof window !== "undefined") return window.location.href;
    return "";
  }, [url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const iconSize = isMobile ? 32 : 36;

  return (
    <AppDialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      sx={{
        "& .MuiDialog-paper": {
          overflow: "hidden",
          bgcolor: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(12px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        },
      }}
      dialogTitle={
        <AppFlexLayout
          justify="space-between"
          align="center"
          sx={{ width: "100%", px: 1 }}
        >
          <AppFlexLayout gap={1.5} align="center">
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}
            >
              Share Content
            </Typography>
          </AppFlexLayout>

          <IconButton
            size="medium"
            icon={<X size={18} />}
            onClick={onClose}
            sx={{
              color: "text.secondary",
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              borderRadius: theme.shape.borderRadius,
              "&:hover": {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main,
              },
            }}
          />
        </AppFlexLayout>
      }
    >
      <AppFlexLayout direction="column" justify="space-between">
        <AppGridLayout
          columns="repeat(4, 1fr)"
          gap={{ xs: 2, sm: 2.5 }}
          sx={{ p: 3, width: "100%" ,  borderTop: `1px dashed ${theme.palette.divider}`, }}
        >
          {SHARE_PLATFORMS.map(({ label, Button, Icon, color }) => (
            <AppFlexLayout
              key={label}
              direction="column"
              gap={1}
              component={Button}
              url={shareUrl}
              title={title}
              sx={{
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                padding: "12px 4px",
                borderRadius: "16px",
                "&:hover": {
                  bgcolor: alpha(color || theme.palette.primary.main, 0.08),
                  transform: "translateY(-5px)",
                  "& .icon-wrapper": {
                    transform: "scale(1.1)",
                    boxShadow: `0 8px 20px ${alpha(color || "#000", 0.2)}`,
                  },
                },
              }}
            >
              <Box
                className="icon-wrapper"
                sx={{
                  transition: "all 0.3s ease",
                  display: "flex",
                  lineHeight: 0,
                }}
              >
                <Icon size={iconSize} round />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: "text.primary",
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: 0.8,
                }}
              >
                {label}
              </Typography>
            </AppFlexLayout>
          ))}
        </AppGridLayout>
        <Box
          sx={{
            p: 3,
            width: "100%",
            borderTop: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <AppInput
        
            value={shareUrl}
            readOnly
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  size="md"
                  title="Copy link"
                  onClick={handleCopy}
                  icon={copied ? <Check size={16} /> : <Copy size={16} />}
                  sx={{
                   
                    color: copied ? "success.main" : "white",
                    background: alpha(theme.palette.primary.main , 0.2),
                    borderRadius: theme.shape.borderRadius,
                  }}
                />
              </InputAdornment>
            }
          />
        </Box>
      </AppFlexLayout>
    </AppDialog>
  );
};

export default ShareDialog;
