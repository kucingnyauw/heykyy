import { useRef } from "react";
import PropTypes from "prop-types";
import Slider from "react-slick";
import { Image as ImageIcon } from "lucide-react";
import { Box, useTheme, alpha } from "@mui/material";

/**
 * A custom Carousel component wrapping react-slick.
 */
const Carousel = ({
  images = [],
  dots = true,
  infinite = true,
  arrows = false,
  speed = 500,
  slideToShow = 1,
  slidesToScroll = 1,
  autoPlay = false,
  autoPlaySpeed = 3000,
  beforeChange,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const sliderRef = useRef(null);

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(theme.palette.background.default, 0.4),
          borderRadius: theme.shape.borderRadius,
          border: `1px dashed ${theme.palette.divider}`,
          minHeight: 200,
          ...sx,
        }}
      >
        <ImageIcon
          size={48}
          style={{ opacity: 0.3, color: theme.palette.text.secondary }}
        />
      </Box>
    );
  }

  const settings = {
    dots,
    infinite,
    arrows,
    speed,
    slidesToShow: slideToShow,
    slidesToScroll,
    autoplay: autoPlay,
    autoplaySpeed: autoPlaySpeed,
    beforeChange,
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: theme.shape.borderRadius,
        "& .slick-slider, & .slick-list, & .slick-track": {
          height: "100%",
        },
        "& .slick-slide > div": {
          height: "100%",
        },
        ...sx,
      }}
      {...props}
    >
      <Slider ref={sliderRef} {...settings}>
        {images.map((img, index) => {
          const src = typeof img === "string" ? img : img.src;
          const alt =
            typeof img === "string"
              ? `slide-${index}`
              : img.alt || `slide-${index}`;

          return (
            <Box
              key={index}
              sx={{
                height: "100%",
                width: "100%",
                outline: "none",
                display: "flex !important",
              }}
            >
              <Box
                component="img"
                src={src}
                alt={alt}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
};

Carousel.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        alt: PropTypes.string,
      }),
    ])
  ).isRequired,
  dots: PropTypes.bool,
  infinite: PropTypes.bool,
  arrows: PropTypes.bool,
  speed: PropTypes.number,
  slideToShow: PropTypes.number,
  slidesToScroll: PropTypes.number,
  autoPlay: PropTypes.bool,
  autoPlaySpeed: PropTypes.number,
  beforeChange: PropTypes.func,
  sx: PropTypes.object,
};

export default Carousel;