import React, { useState, useRef, useMemo } from "react";
import Slider from "react-slick";
import PropTypes from "prop-types";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { ImageIcon } from "lucide-react";

/**
 * A responsive carousel component built on top of react-slick.
 * Features automatic height adjustment, autoplay, and fallback for empty image arrays.
 *
 * @param {Object} props - The component props.
 * @param {string[]} [props.images=[]] - An array of image URLs to display in the carousel.
 * @param {Object} [props.sx={}] - Additional MUI system styles to apply to the outer Box container.
 */
export const AppCarousel = ({ images = [], sx = {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [, setCurrentSlide] = useState(0);
  const sliderRef = useRef(null);

  const carouselHeight = isMobile ? 300 : 480;

  const sliderSettings = useMemo(
    () => ({
      dots: false,
      infinite: images.length > 1,
      arrows: false,
      speed: 400,
      slidesToShow: 1,
      slidesToScroll: 1,
      autoplay: images.length > 1,
      autoplaySpeed: 3000,
      beforeChange: (_, next) => setCurrentSlide(next),
    }),
    [images.length]
  );

  const renderedSlides = useMemo(
    () =>
      images.map((img, idx) => (
        <Box
          key={idx}
          sx={{
            width: "100%",
            height: carouselHeight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            component="img"
            src={img}
            alt={`carousel-slide-${idx}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: 0,
              backgroundColor: theme.palette.background.paper,
            }}
          />
        </Box>
      )),
    [images, carouselHeight, theme.palette.background.paper]
  );

  if (!images || images.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          height: carouselHeight,
          bgcolor: theme.palette.action.hover,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...sx,
        }}
      >
        <ImageIcon size={40} color={theme.palette.text.disabled} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        position: "relative",
        height: carouselHeight,
        overflow: "hidden",
        ...sx,
      }}
    >
      <Slider ref={sliderRef} {...sliderSettings}>
        {renderedSlides}
      </Slider>
    </Box>
  );
};

AppCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string),
  sx: PropTypes.object,
};