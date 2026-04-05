import PropTypes from "prop-types";
import { Card, CardContent, Typography, useTheme, alpha } from "@mui/material";

/**
 * Komponen CertificateCard untuk menampilkan informasi sertifikat.
 * @param {Object} props - Properti komponen.
 * @param {Object} props.certificate - Data sertifikat yang akan ditampilkan.
 * @param {string} props.certificate.title - Judul sertifikat.
 * @param {string} props.certificate.summary - Ringkasan atau deskripsi sertifikat.
 * @param {Function} [props.onClick] - Fungsi callback saat card di-klik.
 */
const CertificateCard = ({ certificate, onClick }) => {
  const theme = useTheme();

  return (
    <Card
      onClick={onClick}
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        backgroundColor: alpha(theme.palette.background.default, 0.2),
        transition: theme.transitions.create(
          ["transform", "border-color", "box-shadow"],
          { duration: theme.transitions.duration.short }
        ),
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              borderColor: alpha(theme.palette.primary.main, 0.4),
              boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.05)}`,
              "& .title-text": { color: theme.palette.primary.main },
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
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
            mb: 1,
          }}
        >
          {certificate?.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            opacity: 0.85,
          }}
        >
          {certificate?.summary}
        </Typography>
      </CardContent>
    </Card>
  );
};

CertificateCard.propTypes = {
  certificate: PropTypes.shape({
    title: PropTypes.string,
    summary: PropTypes.string,
  }),
  onClick: PropTypes.func,
};

export default CertificateCard;