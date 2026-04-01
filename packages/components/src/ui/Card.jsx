import { useMemo } from "react";
import {
  Card,
  CardContent,
  useTheme,
  Box,
  Typography,
  Divider,
  Rating,
  Avatar,
  Tooltip,
  alpha,
} from "@mui/material";
import PropTypes from "prop-types";
import { FilledButton, OutlinedButton } from "./Button";
import { AppFlexLayout } from "./Layout";
import { Calendar, Eye, ImageIcon, Check, User, Quote } from "lucide-react";

/**
 * Custom hook to generate base styles for Card components.
 * * @param {Object} theme - MUI theme object.
 * @param {boolean} [clickable=false] - Determines if the card has hover and active interactions.
 * @returns {Object} Style object for the 'sx' prop.
 */
const useCardStyles = (theme, clickable = false) => {
  return useMemo(
    () => ({
      height: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.background.default, 0.2),
      border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
      boxShadow:
        "rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px",
      position: "relative",
      overflow: "hidden",
      transition: theme.transitions.create(
        ["transform", "box-shadow", "border-color"],
        {
          duration: theme.transitions.duration.shorter,
        }
      ),
      ...(clickable && {
        cursor: "pointer",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.18),
        },
        "&:active": {
          transform: "translateY(-2px)",
        },
      }),
    }),
    [theme, clickable]
  );
};

/**
 * Basic Card component with support for icons, titles, and subtitles.
 * * @param {Object} props - Component props.
 * @param {React.ReactNode} [props.icon] - Icon displayed to the left of the header.
 * @param {React.ReactNode} [props.title] - Card title.
 * @param {React.ReactNode} [props.subtitle] - Card subtitle.
 * @param {React.ReactNode} [props.children] - Additional content inside the card.
 * @param {Object} [props.sx] - Custom MUI styles.
 */
export const AppBasicCard = ({
  icon = null,
  title,
  subtitle,
  children,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const styles = useCardStyles(theme, false);
  const hasHeader = icon || title || subtitle;

  const memoizedHeader = useMemo(() => {
    if (!hasHeader) return null;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: theme.shape.borderRadius,
              bgcolor: theme.palette.action.hover,
              color: theme.palette.primary.main,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {title && (
            <Typography variant="subtitle1" fontWeight={600}>
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    );
  }, [hasHeader, icon, title, subtitle, theme]);

  return (
    <Card {...props} sx={{ ...styles, ...sx }}>
      <CardContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {memoizedHeader}
          {children && <Box>{children}</Box>}
        </Box>
      </CardContent>
    </Card>
  );
};

AppBasicCard.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  children: PropTypes.node,
  sx: PropTypes.object,
};

/**
 * Service Card component for displaying pricing plans or service packages.
 * * @param {Object} props - Component props.
 * @param {string} props.title - Service or package name.
 * @param {string} [props.subtitle] - Brief description.
 * @param {string|number} props.price - Main price display.
 * @param {string|number} [props.originalPrice] - Original price with strikethrough.
 * @param {string[]} [props.features=[]] - List of features with checkmarks.
 * @param {boolean} [props.highlight=false] - If true, applies primary color emphasis.
 * @param {Function} [props.onSelect] - Callback for the CTA button.
 * @param {Object} [props.sx] - Custom MUI styles.
 */
export const AppServiceCard = ({
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
  const styles = useCardStyles(theme, false);

  const highlightOuterStyle = useMemo(
    () =>
      highlight
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
        : {},
    [highlight, theme.palette.primary.main]
  );

  const highlightInnerStyle = useMemo(
    () =>
      highlight
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
          },
    [highlight]
  );

  const renderedFeatures = useMemo(
    () =>
      features.map((item, idx) => (
        <AppFlexLayout key={idx} gap={1.5} align="flex-start">
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
        </AppFlexLayout>
      )),
    [features, theme]
  );

  return (
    <Card {...props} sx={{ ...styles, ...highlightOuterStyle, ...sx }}>
      <Box sx={highlightInnerStyle}>
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            flexDirection: "column",
            height: "100%",
            gap: 2.5,
            bgcolor: highlight ? alpha(theme.palette.primary.main, 0.02) : "transparent",
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
            <AppFlexLayout direction="column" gap={0.5} align="flex-start">
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
              <AppFlexLayout gap={0.5} align="baseline">
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
              </AppFlexLayout>
            </AppFlexLayout>
          </Box>

          <Divider sx={{ borderStyle: "dashed", opacity: 0.6 }} />

          <AppFlexLayout
            direction="column"
            gap={1.5}
            align="stretch"
            sx={{ flexGrow: 1 }}
          >
            {renderedFeatures}
          </AppFlexLayout>

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


AppServiceCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  originalPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  features: PropTypes.arrayOf(PropTypes.string),
  highlight: PropTypes.bool,
  onSelect: PropTypes.func,
  sx: PropTypes.object,
};

/**
 * Review Card component for displaying testimonials or user feedback.
 * * @param {Object} props - Component props.
 * @param {string} [props.avatar] - URL for the user's avatar.
 * @param {string} props.name - Reviewer's name.
 * @param {number} [props.rating=5] - Rating value (1-5).
 * @param {string} props.review - The review text content.
 * @param {Object} [props.sx] - Custom MUI styles.
 */
export const AppReviewCard = ({
  avatar,
  name,
  rating = 5,
  review,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const styles = useCardStyles(theme, false);

  const reviewHeader = useMemo(
    () => (
      <AppFlexLayout gap={2} align="center">
        <Avatar
          src={avatar}
          alt={name}
          sx={{
            width: 44,
            height: 44,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.action.hover,
          }}
        >
          <User size={20} />
        </Avatar>
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {name}
          </Typography>
          <Rating
            value={rating}
            precision={0.5}
            readOnly
            size="small"
            sx={{ fontSize: "0.875rem", mt: 0.25 }}
          />
        </Box>
        <Box sx={{ ml: "auto !important", color: theme.palette.divider }}>
          <Quote size={24} fill="currentColor" style={{ opacity: 0.3 }} />
        </Box>
      </AppFlexLayout>
    ),
    [avatar, name, rating, theme]
  );

  return (
    <Card {...props} sx={{ ...styles, ...sx }}>
      <CardContent
        sx={{
          p: 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
        }}
      >
        {reviewHeader}
        <Divider sx={{ borderStyle: "dashed" }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.7, fontStyle: "italic", flexGrow: 1 }}
        >
          &quot;{review}&quot;
        </Typography>
      </CardContent>
    </Card>
  );
};

AppReviewCard.propTypes = {
  avatar: PropTypes.string,
  name: PropTypes.string.isRequired,
  rating: PropTypes.number,
  review: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

/**
 * Blog Card component for displaying blog post summaries.
 * * @param {Object} props - Component props.
 * @param {Object} props.blog - Blog data object.
 * @param {Function} [props.onRead] - Callback fired when card is clicked.
 */
export const AppBlogCard = ({ blog, onRead }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const styles = useCardStyles(theme, true);

  const cardMedia = useMemo(
    () => (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/10",
          overflow: "hidden",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          flexShrink: 0,
        }}
      >
        {blog?.thumbnail ? (
          <Box
            component="img"
            src={blog.thumbnail}
            alt={blog.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <AppFlexLayout
            align="center"
            justify="center"
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: isDark
                ? alpha(theme.palette.background.paper, 0.7)
                : theme.palette.action.hover,
            }}
          >
            <ImageIcon size={32} color={theme.palette.text.disabled} />
          </AppFlexLayout>
        )}

        <AppFlexLayout
          gap={0.75}
          align="center"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.common.black, 0.6),
            backdropFilter: "blur(4px)",
            color: theme.palette.common.white,
          }}
        >
          <Eye size={12} strokeWidth={2.5} />
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ fontSize: "0.75rem" }}
          >
            {blog?.stats?.views || 0}
          </Typography>
        </AppFlexLayout>
      </Box>
    ),
    [blog?.thumbnail, blog?.title, blog?.stats?.views, theme, isDark]
  );

  return (
    <Card
      onClick={() => onRead?.(blog?.slug)}
      sx={{
        ...styles,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      {cardMedia}

      <CardContent
        sx={{
          p: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          sx={{
            lineHeight: 1.3,
            fontSize: "1.05rem",
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog?.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {blog?.summary}
        </Typography>

        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />

        <AppFlexLayout
          justify="space-between"
          align="center"
          sx={{ mt: "auto" }}
        >
          <AppFlexLayout gap={1} align="center">
            <Tooltip title={blog?.author?.name || "Unknown"} arrow>
              <Avatar
                src={blog?.author?.avatar}
                alt={blog?.author?.name}
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: "0.75rem",
                  border: `2px solid ${theme.palette.background.paper}`,
                  bgcolor: theme.palette.action.hover,
                }}
              >
                {blog?.author?.name?.charAt(0)}
              </Avatar>
            </Tooltip>
          </AppFlexLayout>

          <AppFlexLayout
            gap={0.5}
            align="center"
            sx={{ color: "text.secondary" }}
          >
            <Calendar size={14} />
            <Typography variant="caption" fontWeight={500}>
              {blog?.createdAt}
            </Typography>
          </AppFlexLayout>
        </AppFlexLayout>
      </CardContent>
    </Card>
  );
};

AppBlogCard.propTypes = {
  blog: PropTypes.object.isRequired,
  onRead: PropTypes.func,
};

/**
 * Project Card component for displaying portfolio items.
 * * @param {Object} props - Component props.
 * @param {Object} props.project - Project data object.
 * @param {Function} [props.onClick] - Callback fired when card is clicked.
 */
export const AppProjectCard = ({ project, onClick }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const styles = useCardStyles(theme, true);

  const maxAvatars = 4;
  const projectStacks = useMemo(
    () => (Array.isArray(project?.stacks) ? project.stacks : []),
    [project?.stacks]
  );
  const displayStacks = useMemo(
    () => projectStacks.slice(0, maxAvatars),
    [projectStacks]
  );
  const extraStacks = useMemo(
    () => Math.max(0, projectStacks.length - maxAvatars),
    [projectStacks.length]
  );

  const cardMedia = useMemo(
    () => (
      <Box
        sx={{
          position: "relative",
          width: "100%",
          aspectRatio: "16/10",
          overflow: "hidden",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          flexShrink: 0,
        }}
      >
        {project?.thumbnail ? (
          <Box
            component="img"
            src={project.thumbnail}
            alt={project.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <AppFlexLayout
            align="center"
            justify="center"
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: isDark
                ? alpha(theme.palette.background.paper, 0.7)
                : theme.palette.action.hover,
            }}
          >
            <ImageIcon size={32} color={theme.palette.text.disabled} />
          </AppFlexLayout>
        )}

        <AppFlexLayout
          gap={0.75}
          align="center"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: theme.shape.borderRadius,
            bgcolor: alpha(theme.palette.common.black, 0.6),
            backdropFilter: "blur(4px)",
            color: theme.palette.common.white,
          }}
        >
          <Eye size={12} strokeWidth={2.5} />
          <Typography
            variant="caption"
            fontWeight={600}
            sx={{ fontSize: "0.75rem" }}
          >
            {project?.stats?.views || 0}
          </Typography>
        </AppFlexLayout>
      </Box>
    ),
    [project, theme, isDark]
  );

  return (
    <Card
      onClick={() => onClick?.(project?.slug)}
      sx={{
        ...styles,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover img": { transform: "scale(1.05)" },
      }}
    >
      {cardMedia}
      <CardContent
        sx={{
          p: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={600}
          color="text.primary"
          sx={{
            lineHeight: 1.3,
            fontSize: "1.05rem",
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project?.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {project?.summary}
        </Typography>

        <Divider sx={{ my: 2, borderStyle: "dashed", opacity: 0.5 }} />

        <AppFlexLayout
          justify="space-between"
          align="center"
          sx={{ mt: "auto" }}
        >
          <AppFlexLayout
            align="center"
            sx={{ "& > *:not(:first-of-type)": { ml: -1 } }}
          >
            {displayStacks.map((stack) => (
              <Tooltip key={stack.name} title={stack.name} arrow>
                <Avatar
                  src={stack.icon}
                  alt={stack.name}
                  sx={{
                    width: 28,
                    height: 28,
                    border: `2px solid ${theme.palette.background.paper}`,
                    bgcolor: theme.palette.action.hover,
                    img: { objectFit: "contain", p: 0.5 },
                  }}
                />
              </Tooltip>
            ))}

            {extraStacks > 0 && (
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: "0.65rem",
                  bgcolor: theme.palette.action.selected,
                  color: "text.primary",
                  border: `2px solid ${theme.palette.background.paper}`,
                  fontWeight: 600,
                }}
              >
                +{extraStacks}
              </Avatar>
            )}
          </AppFlexLayout>

          <AppFlexLayout
            gap={0.5}
            align="center"
            sx={{ color: "text.secondary" }}
          >
            <Calendar size={14} />
            <Typography variant="caption" fontWeight={500}>
              {project?.createdAt}
            </Typography>
          </AppFlexLayout>
        </AppFlexLayout>
      </CardContent>
    </Card>
  );
};

AppProjectCard.propTypes = {
  project: PropTypes.object.isRequired,
  onClick: PropTypes.func,
};

/**
 * Certificate Card component for showcasing awards or certifications.
 * * @param {Object} props - Component props.
 * @param {Object} props.certificate - Certificate data object.
 */
export const AppCertificateCard = ({ certificate }) => {
  const theme = useTheme();
  const styles = useCardStyles(theme, true);

  return (
    <Card
      onClick={() => window.open(certificate?.file?.url, "_blank")}
      sx={{
        ...styles,
        border: "none",
        bgcolor: "transparent",
        boxShadow: "none",
        "&:hover": {
          "& .title-text": { color: theme.palette.primary.main },
        },
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography
          className="title-text"
          variant="subtitle1"
          fontWeight={600}
          sx={{
            lineHeight: 1.4,
            transition: "color 0.2s ease",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 0.5,
          }}
        >
          {certificate?.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            fontSize: "0.85rem",
            lineHeight: 1.6,
            opacity: 0.8,
          }}
        >
          {certificate?.summary}
        </Typography>
      </CardContent>
    </Card>
  );
};

AppCertificateCard.propTypes = {
  certificate: PropTypes.object.isRequired,
};
