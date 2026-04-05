import { Chip, useMediaQuery, useTheme, alpha } from "@mui/material";
import { Sparkle } from "lucide-react";

const SectionTag = ({ label, icon: Icon }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Chip
      icon={
        Icon
          ? <Icon fill="currentColor" size={isMobile ? 14 : 18} />
          : <Sparkle size={isMobile ? 14 : 18} />
      }
      label={label}
      sx={{
        px: isMobile ? 0.5 : 1,
        height: isMobile ? 28 : 36,
        borderRadius: "99px",
        bgcolor: alpha(theme.palette.text.disabled, theme.palette.mode === "dark" ? 0.8 : 0.08),
        fontWeight: 500,
        border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
        backdropFilter: "blur(8px)",
        "& .MuiChip-label": {
          px: isMobile ? 1 : 1.5,
        },
      }}
    />
  );
};

export default SectionTag;