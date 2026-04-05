import React from "react";
import { Box } from "@mui/material";
import { Size } from "@heykyy/theme";
import PropTypes from "prop-types";

/**
 * A layout component that utilizes CSS Grid.
 * Built to seamlessly support MUI's responsive properties (e.g., objects or arrays for breakpoints).
 *
 * @param {Object} props - The component props.
 * @param {string|Object|Array} [props.columns="repeat(12, 1fr)"] - The grid-template-columns CSS property.
 * @param {number|Object|Array} [props.gap=2] - The gap between grid items (MUI spacing multiplier).
 * @param {string|Object|Array} [props.align="stretch"] - The align-items CSS property. Options: ['start', 'center', 'end', 'stretch', 'baseline']
 * @param {string|Object|Array} [props.justify="stretch"] - The justify-items CSS property. Options: ['start', 'center', 'end', 'stretch']
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
  return (
    <Box
      {...props}
      sx={{
        display: "grid",
        gridTemplateColumns: columns,
        gap,
        alignItems: align,
        justifyItems: justify,
        ...sx,
      }}
    >
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
    PropTypes.oneOf(["start", "center", "end", "stretch", "baseline"]),
    PropTypes.object,
    PropTypes.array,
  ]),
  justify: PropTypes.oneOfType([
    PropTypes.oneOf(["start", "center", "end", "stretch"]),
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
 * @param {string|Object|Array} [props.direction="row"] - The flex-direction CSS property. Options: ['row', 'row-reverse', 'column', 'column-reverse']
 * @param {number|Object|Array} [props.gap=2] - The gap between flex items (MUI spacing multiplier).
 * @param {string|Object|Array} [props.align="center"] - The align-items CSS property. Options: ['flex-start', 'center', 'flex-end', 'stretch', 'baseline']
 * @param {string|Object|Array} [props.justify="flex-start"] - The justify-content CSS property. Options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']
 * @param {string|Object|Array} [props.wrap="nowrap"] - The flex-wrap CSS property. Options: ['nowrap', 'wrap', 'wrap-reverse']
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
  return (
    <Box
      {...props}
      sx={{
        display: "flex",
        flexDirection: direction,
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

AppFlexLayout.propTypes = {
  direction: PropTypes.oneOfType([
    PropTypes.oneOf(["row", "row-reverse", "column", "column-reverse"]),
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
    PropTypes.oneOf([
      "flex-start",
      "center",
      "flex-end",
      "stretch",
      "baseline",
    ]),
    PropTypes.object,
    PropTypes.array,
  ]),
  justify: PropTypes.oneOfType([
    PropTypes.oneOf([
      "flex-start",
      "center",
      "flex-end",
      "space-between",
      "space-around",
      "space-evenly",
    ]),
    PropTypes.object,
    PropTypes.array,
  ]),
  wrap: PropTypes.oneOfType([
    PropTypes.oneOf(["nowrap", "wrap", "wrap-reverse"]),
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
  paddingY = { xs: 4, sm: 6, md: 8 },
  paddingX = { xs: 4, sm: 6, md: 8 },
  center = false,
  fullWidth = false,
  sx,
  children,
  ...props
}) => {
  const resolveSpacing = (value) => {
    if (typeof value === "number") return Size.spacing[value];
    if (typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, Size.spacing[v]])
      );
    }
    return value;
  };

  const resolveContainer = (value) => {
    if (typeof value === "string") return Size.container[value] || value;
    if (typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, Size.container[v] || v])
      );
    }
    return value;
  };

  const sectionSx = {
    width: "100%",
    maxWidth: fullWidth ? "100%" : resolveContainer(maxWidth),
    px: resolveSpacing(paddingX),
    py: resolveSpacing(paddingY),
    display: center ? "flex" : "block",
    alignItems: center ? "center" : undefined,
    justifyContent: center ? "center" : undefined,
    ...sx,
  };

  const innerSx = {
    m : "0 auto" ,
    width : "100%"
  };

  return (
    <Box component="section" {...props} sx={sectionSx}>
      <Box sx={innerSx}>{children}</Box>
    </Box>
  );
};

AppSectionLayout.propTypes = {
  maxWidth: PropTypes.oneOf(["sm", "md", "lg", "xl", "2xl"]),
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
  fullWidth: PropTypes.bool,
  sx: PropTypes.object,
  children: PropTypes.node,
};
