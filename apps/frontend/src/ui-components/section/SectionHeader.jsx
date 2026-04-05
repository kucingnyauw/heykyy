import { Typography, Stack, useTheme, alpha } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import SectionTag from "./SectionTag";

const SectionHeader = ({ label, icon, title, subTitle }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Stack
      direction="column"
      spacing={{ xs: 4, md: 6 }}
      alignItems="center"
      textAlign="center"
    >
      {label && <SectionTag label={label} icon={icon} />}

      <Stack direction="column" spacing={2} alignItems="center">
        {title && (
          <Typography
            variant={isMobile ? "h3" : "h2"}
            sx={{
              fontWeight: 400,
              lineHeight: 1.25,
              maxWidth: { xs: 340, sm: 520, md: 720 },
              letterSpacing: "-0.02em",
              background: `linear-gradient(135deg, ${
                theme.palette.text.primary
              } 0%, ${alpha(theme.palette.text.primary, 0.7)} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {title}
          </Typography>
        )}

        {subTitle && (
          <Typography
            variant="body1"
            sx={{
              maxWidth: { xs: 340, sm: 520, md: 820 },
              ...(isDark
                ? {
                    background: theme.palette.custom?.gradient?.subtitle,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }
                : {
                    color: theme.palette.text.secondary,
                  }),
            }}
          >
            {subTitle}
          </Typography>
        )}
      </Stack>
    </Stack>
  );
};

export default SectionHeader;