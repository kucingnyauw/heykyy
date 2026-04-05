import React from "react";
import PropTypes from "prop-types";
import {
  Button as MUIButton,
  IconButton as MUIIconButton,
  useTheme,
  Tooltip,
} from "@mui/material";

import { Size } from "@heykyy/theme";

/**
 * Custom hook to generate base styles for standard buttons.
 * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} size - The desired size of the button.
 * @returns {Object} An object containing the generated CSS-in-JS styles.
 */
const useBtnStyles = (size = "medium") => {
  const theme = useTheme();
  const btnSize = Size.button[size];

  return {
    minHeight: btnSize.height,
    height: btnSize.height,
    padding: btnSize.padding,
    fontSize: btnSize.fontSize,
    fontWeight: btnSize.fontWeight,
    lineHeight: btnSize.lineHeight,
    borderRadius: theme.shape.borderRadius,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textTransform: "none",
    boxSizing: "border-box",
    gap: theme.spacing(2),
    "& .MuiButton-startIcon, & .MuiButton-endIcon": {
      margin: 0,
      display: "inherit",
      "& > *": {
        fontSize: "1.1em",
      },
    },
  };
};

/**
 * A custom Filled Button component (contained variant) with a hover sweep effect.
 * @param {Object} props - The component props.
 * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} [props.size="medium"] - The size of the button.
 * @param {React.ReactNode} props.children - The content to be rendered inside the button.
 * @param {React.ReactNode} [props.startIcon] - Element placed before the children.
 * @param {React.ReactNode} [props.endIcon] - Element placed after the children.
 * @param {Object} [props.sx] - Additional MUI system styles to apply to the button.
 */
export const FilledButton = ({
  size = "medium",
  children,
  startIcon,
  endIcon,
  sx,
  ...props
}) => {
  const baseStyles = useBtnStyles(size);

  return (
    <MUIButton
      variant="contained"
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        ...baseStyles,
        position: "relative",
        overflow: "hidden",
        boxShadow: Size.shadow[3],
        "&:hover": {
          boxShadow: Size.shadow[5],
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: "-100%",
          width: "150%",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
          transform: "skewX(-20deg)",
          transition: "left 0.6s ease-in-out",
        },
        "&:hover::after": {
          left: "100%",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MUIButton>
  );
};

FilledButton.propTypes = {
  size: PropTypes.oneOf([
    "extraSmall",
    "small",
    "medium",
    "large",
    "extraLarge",
  ]),
  children: PropTypes.node.isRequired,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  sx: PropTypes.object,
};

/**
 * A custom Outlined Button component.
 * @param {Object} props - The component props.
 * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} [props.size="medium"] - The size of the button.
 * @param {React.ReactNode} props.children - The content to be rendered inside the button.
 * @param {React.ReactNode} [props.startIcon] - Element placed before the children.
 * @param {React.ReactNode} [props.endIcon] - Element placed after the children.
 * @param {Object} [props.sx] - Additional MUI system styles to apply to the button.
 */
export const OutlinedButton = ({
  size = "medium",
  children,
  startIcon,
  endIcon,
  sx,
  ...props
}) => {
  const baseStyles = useBtnStyles(size);

  return (
    <MUIButton
      variant="outlined"
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        ...baseStyles,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MUIButton>
  );
};

OutlinedButton.propTypes = {
  size: PropTypes.oneOf([
    "extraSmall",
    "small",
    "medium",
    "large",
    "extraLarge",
  ]),
  children: PropTypes.node.isRequired,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  sx: PropTypes.object,
};

/**
 * A custom Text Button component.
 * @param {Object} props - The component props.
 * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} [props.size="medium"] - The size of the button.
 * @param {React.ReactNode} props.children - The content to be rendered inside the button.
 * @param {React.ReactNode} [props.startIcon] - Element placed before the children.
 * @param {React.ReactNode} [props.endIcon] - Element placed after the children.
 * @param {Object} [props.sx] - Additional MUI system styles to apply to the button.
 */
export const TextButton = ({
  size = "medium",
  children,
  startIcon,
  endIcon,
  sx,
  ...props
}) => {
  const baseStyles = useBtnStyles(size);

  return (
    <MUIButton
      variant="text"
      startIcon={startIcon}
      endIcon={endIcon}
      sx={{
        ...baseStyles,
        "&:hover": {
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MUIButton>
  );
};

TextButton.propTypes = {
  size: PropTypes.oneOf([
    "extraSmall",
    "small",
    "medium",
    "large",
    "extraLarge",
  ]),
  children: PropTypes.node.isRequired,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  sx: PropTypes.object,
};

/**
 * Custom hook to generate styles for icon buttons.
 * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} size - The desired size of the icon button.
 * @returns {Object} An object containing the generated CSS-in-JS styles.
 */
const useIconBtnStyles = (size = "medium") => {
  const iconSize = Size.button.icon[size];

  return {
    width: iconSize.size,
    height: iconSize.size,
    padding: iconSize.padding,
    fontSize: iconSize.fontSize,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.06)",
    },
  };
};

/**
 * A custom Icon Button component with an optional tooltip.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.icon - The icon element to display.
 * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} [props.size="medium"] - The size of the icon button.
 * @param {string} [props.title] - Optional tooltip text. If provided, wraps the button in a Tooltip.
 * @param {Object} [props.sx] - Additional MUI system styles to apply to the button.
 */
export const IconButton = ({
  icon,
  size = "medium",
  title = null,
  sx,
  ...props
}) => {
  const baseStyles = useIconBtnStyles(size);

  const button = (
    <MUIIconButton
      sx={{
        ...baseStyles,
        ...sx,
      }}
      {...props}
    >
      {icon}
    </MUIIconButton>
  );

  return title ? (
    <Tooltip title={title} arrow>
      {button}
    </Tooltip>
  ) : (
    button
  );
};

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  size: PropTypes.oneOf([
    "extraSmall",
    "small",
    "medium",
    "large",
    "extraLarge",
  ]),
  title: PropTypes.string,
  sx: PropTypes.object,
};