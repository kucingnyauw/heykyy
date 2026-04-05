import PropTypes from "prop-types";
import {
  useTheme,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Divider,
  alpha,
  Stack,
} from "@mui/material";
import { User, Quote } from "lucide-react";

/**
 * A card component to display user reviews or testimonials.
 */
const ReviewCard = ({
  avatar,
  name,
  rating = 5,
  review,
  sx,
  ...props
}) => {
  const theme = useTheme();

  const reviewHeader = (
    <Stack direction="row" spacing={2} alignItems="center">
      <Avatar
        src={avatar}
        alt={name}
        sx={{
          width: 44,
          height: 44,
          bgcolor: theme.palette.action?.hover || alpha(theme.palette.text.primary, 0.04),
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
    </Stack>
  );

  return (
    <Card
      {...props}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.background.default, 0.2),
        transition: theme.transitions.create(
          ["transform", "border-color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.05)}`,
          "& .MuiAvatar-root": {
            borderColor: theme.palette.primary.main,
          },
        },
        ...sx,
      }}
    >
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
        <Divider sx={{ borderStyle: "dashed", opacity: 0.5 }} />
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

ReviewCard.propTypes = {
  avatar: PropTypes.string,
  name: PropTypes.string.isRequired,
  rating: PropTypes.number,
  review: PropTypes.string.isRequired,
  sx: PropTypes.object,
};

export default ReviewCard;