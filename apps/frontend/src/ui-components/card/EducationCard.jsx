import { useCallback } from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography, useTheme, alpha, Box } from "@mui/material";
import { Calendar , GraduationCap } from "lucide-react";

/**
 * Komponen EducationCard untuk menampilkan riwayat pendidikan.
 * @param {Object} props - Properti komponen.
 * @param {Object} props.education - Data pendidikan yang akan ditampilkan.
 */
const EducationCard = ({ education }) => {
  const theme = useTheme();



  const formatYear = useCallback((d) => (d ? new Date(d).getFullYear() : "Present"), []);

  return (
    <Card
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        backgroundColor: alpha(theme.palette.background.default, 0.2),
        transition: theme.transitions.create(
          ["transform", "border-color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        "&:hover": {
          transform: "translateY(-4px)",
          borderColor: alpha(theme.palette.primary.main, 0.4),
          boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.05)}`,
        },
      }}
    >
      <CardContent 
        sx={{ 
          p: { xs: 2.5, sm: 3.5 }, 
          display: "flex", 
          flexDirection: "column", 
          gap: 1 
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.4}>
            {education?.title}
            {education?.institution && (
              <Box component="span" sx={{ color: "primary.main", fontWeight: 500 }}>
                {` - ${education.institution}`}
              </Box>
            )}
          </Typography>

          <Box 
            sx={{ 
              display: { xs: "flex", sm: "none" }, 
              alignItems: "center", 
              gap: 1, 
              mt: 1.5, 
              color: "text.secondary" 
            }}
          >
            <Calendar size={14} />
            <Typography variant="caption" fontWeight={500}>
              {formatYear(education?.startYear)} - {formatYear(education?.endYear)}
            </Typography>
          </Box>
        </Box>

        {education?.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.65,
              opacity: 0.85,
            }}
          >
            {education.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

EducationCard.propTypes = {
  education: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    institution: PropTypes.string,
    startYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    endYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default EducationCard;