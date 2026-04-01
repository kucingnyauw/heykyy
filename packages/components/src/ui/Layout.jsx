import { useMemo } from "react";
import { Box } from "@mui/material";
import PropTypes from "prop-types";

/**
 * A layout component that utilizes CSS Grid.
 * Built to seamlessly support MUI's responsive properties (e.g., objects or arrays for breakpoints).
 *
 * @param {Object} props - The component props.
 * @param {string|Object|Array} [props.columns="repeat(12, 1fr)"] - The grid-template-columns CSS property.
 * @param {number|Object|Array} [props.gap=2] - The gap between grid items (MUI spacing multiplier).
 * @param {string|Object|Array} [props.align="stretch"] - The align-items CSS property.
 * @param {string|Object|Array} [props.justify="stretch"] - The justify-items CSS property.
 * @param {Object} [props.sx] - Additional MUI system styles.
 * @param {React.ReactNode} props.children - The content of the grid.
 */
export const AppGridLayout = ({
  columns = "repeat(12, 1fr)",
  gap = 2,
  align = "stretch",
  justify = "stretch",
  sx,
  children,
  ...props
}) => {
  const gridSx = useMemo(
    () => ({
      display: "grid",
      gridTemplateColumns: columns,
      gap,
      alignItems: align,
      justifyItems: justify,
      ...sx,
    }),
    [columns, gap, align, justify, sx]
  );

  return (
    <Box {...props} sx={gridSx}>
      {children}
    </Box>
  );
};

AppGridLayout.propTypes = {
  columns: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  gap: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  align: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  justify: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  sx: PropTypes.object,
  children: PropTypes.node,
};

/**
 * A layout component that utilizes CSS Flexbox.
 * Supports MUI responsive properties for robust layout management.
 *
 * @param {Object} props - The component props.
 * @param {string|Object|Array} [props.direction="row"] - The flex-direction CSS property.
 * @param {number|Object|Array} [props.gap=2] - The gap between flex items (MUI spacing multiplier).
 * @param {string|Object|Array} [props.align="center"] - The align-items CSS property.
 * @param {string|Object|Array} [props.justify="flex-start"] - The justify-content CSS property.
 * @param {string|Object|Array} [props.wrap="nowrap"] - The flex-wrap CSS property.
 * @param {Object} [props.sx] - Additional MUI system styles.
 * @param {React.ReactNode} props.children - The content of the flex container.
 */
export const AppFlexLayout = ({
  direction = "row",
  gap = 2,
  align = "center",
  justify = "flex-start",
  wrap = "nowrap",
  sx,
  children,
  ...props
}) => {
  const flexSx = useMemo(
    () => ({
      display: "flex",
      flexDirection: direction,
      gap,
      alignItems: align,
      justifyContent: justify,
      flexWrap: wrap,
      ...sx,
    }),
    [direction, gap, align, justify, wrap, sx]
  );

  return (
    <Box {...props} sx={flexSx}>
      {children}
    </Box>
  );
};

AppFlexLayout.propTypes = {
  direction: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  gap: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  align: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  justify: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  wrap: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  sx: PropTypes.object,
  children: PropTypes.node,
};

/**
 * A section layout component designed for page wrappers or main content areas.
 * Features customizable max-width and centering capabilities.
 *
 * @param {Object} props - The component props.
 * @param {string|number|Object|Array} [props.maxWidth="lg"] - The maximum width of the inner content.
 * @param {number|Object|Array} [props.paddingY={ xs: 1, sm: 2, md: 2 }] - The vertical padding (MUI spacing multiplier).
 * @param {number|Object|Array} [props.paddingX={ xs: 3, sm: 4, md: 8 }] - The horizontal padding (MUI spacing multiplier).
 * @param {boolean} [props.center=false] - Whether to apply flex centering to the section container.
 * @param {Object} [props.sx] - Additional MUI system styles for the outer section box.
 * @param {React.ReactNode} props.children - The main content of the section.
 */
export const AppSectionLayout = ({
  maxWidth = "lg",
  paddingY = { xs: 1, sm: 2, md: 2 },
  paddingX = { xs: 3, sm: 4, md: 8 },
  center = false,
  sx,
  children,
  ...props
}) => {
  const sectionSx = useMemo(
    () => ({
      width: "100%",
      px: paddingX,
      py: paddingY,
      display: center ? "flex" : "block",
      alignItems: center ? "center" : "unset",
      justifyContent: center ? "center" : "unset",
      ...sx,
    }),
    [paddingX, paddingY, center, sx]
  );

  const innerSx = useMemo(
    () => ({
      width: "100%",
      maxWidth,
      mx: "auto",
    }),
    [maxWidth]
  );

  return (
    <Box component="section" {...props} sx={sectionSx}>
      <Box sx={innerSx}>{children}</Box>
    </Box>
  );
};

AppSectionLayout.propTypes = {
  maxWidth: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
    PropTypes.array,
  ]),
  paddingY: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  paddingX: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.object,
    PropTypes.array,
  ]),
  center: PropTypes.bool,
  sx: PropTypes.object,
  children: PropTypes.node,
};