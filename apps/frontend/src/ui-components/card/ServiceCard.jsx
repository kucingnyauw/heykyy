import PropTypes from "prop-types";
import {
  useTheme,
  Box,
  Typography,
  Card,
  CardContent,
  alpha,
  Divider,
  Stack,
} from "@mui/material";
import { Check } from "lucide-react";
import { FilledButton, OutlinedButton } from "@heykyy/components";

/**
 * A card component to display service pricing and features.
 */
const ServiceCard = ({
  title,
  subtitle,
  price,
  originalPrice,
  features = [],
  highlight = false,
  onSelect,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const highlightOuterStyle = highlight
    ? {
        position: "relative",
        overflow: "hidden",
        p: "2px",
        borderColor: "transparent",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: `conic-gradient(from 0deg, transparent 70%, ${theme.palette.primary.main} 100%)`,
          animation: "spin 2.5s linear infinite",
          zIndex: 0,
        },
        "@keyframes spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      }
    : {};

  const highlightInnerStyle = highlight
    ? {
        position: "relative",
        zIndex: 1,
        bgcolor: "background.paper",
        height: "100%",
        borderRadius: "inherit",
      }
    : {
        height: "100%",
        borderRadius: "inherit",
      };

  const renderedFeatures = features.map((item, idx) => (
    <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          mt: 0.5,
          p: 0.25,
          borderRadius: "50%",
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          display: "flex",
          flexShrink: 0,
          width: 16,
          height: 16,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Check size={10} strokeWidth={4} />
      </Box>
      <Typography variant="body2" color="text.primary">
        {item}
      </Typography>
    </Stack>
  ));

  return (
    <Card
      {...props}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.background.default, 0.2),
        boxShadow: theme.shadows[4],
        position: "relative",
        overflow: "hidden",
        ...highlightOuterStyle,
        ...sx,
      }}
    >
      <Box sx={highlightInnerStyle}>
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 2.5,
            bgcolor: highlight
              ? alpha(theme.palette.primary.main, 0.02)
              : "transparent",
            borderRadius: "inherit",
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box>
            <Stack direction="column" spacing={0.5} alignItems="flex-start">
              {originalPrice && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: "line-through",
                    opacity: 0.6,
                    fontWeight: 500,
                  }}
                >
                  {originalPrice}
                </Typography>
              )}
              <Stack direction="row" spacing={0.5} alignItems="baseline">
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  {price}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={500}
                >
                  / Project
                </Typography>
              </Stack>
            </Stack>
          </Box>

          <Divider sx={{ borderStyle: "dashed", opacity: 0.6 }} />

          <Stack direction="column" spacing={1.5} alignItems="stretch" sx={{ flexGrow: 1 }}>
            {renderedFeatures}
          </Stack>

          {onSelect && (
            <Box mt="auto" pt={1}>
              {highlight ? (
                <FilledButton fullWidth size="medium" onClick={onSelect}>
                  Get Started
                </FilledButton>
              ) : (
                <OutlinedButton fullWidth size="medium" onClick={onSelect}>
                  Get Started
                </OutlinedButton>
              )}
            </Box>
          )}
        </CardContent>
      </Box>
    </Card>
  );
};

ServiceCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  originalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  features: PropTypes.arrayOf(PropTypes.string),
  highlight: PropTypes.bool,
  onSelect: PropTypes.func,
  sx: PropTypes.object,
};

export default ServiceCard;