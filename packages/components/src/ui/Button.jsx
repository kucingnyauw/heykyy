import React, { useMemo } from "react";
import {
  Button as MUIButton,
  IconButton as MUIIconButton,
  useTheme,
  Tooltip,
} from "@mui/material";

/**
 * Configuration object for button and icon sizes, as well as shadows.
 */
const Size = {
  btn: {
    extraSmall: {
      height: "32px",
      padding: "0 12px",
      fontSize: "0.75rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.25rem",
    },
    small: {
      height: "36px",
      padding: "0 14px",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.375rem",
    },
    medium: {
      height: "40px",
      padding: "0 16px",
      fontSize: "0.875rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.5rem",
    },
    large: {
      height: "48px",
      padding: "0 20px",
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: "1.25",
      borderRadius: "0.625rem",
    },
    extraLarge: {
      height: "56px",
      padding: "0 24px",
      fontSize: "1.125rem",
      fontWeight: 600,
      lineHeight: "1.25",
      borderRadius: "0.75rem",
    },
    icon: {
      extraSmall: {
        size: "32px",
        padding: "4px",
        fontSize: "0.75rem",
      },
      small: {
        size: "36px",
        padding: "4px",
        fontSize: "0.875rem",
      },
      medium: {
        size: "40px",
        padding: "6px",
        fontSize: "0.875rem",
      },
      large: {
        size: "48px",
        padding: "8px",
        fontSize: "1rem",
      },
      extraLarge: {
        size: "56px",
        padding: "10px",
        fontSize: "1.125rem",
      },
    },
  },
  shadow: {
    small: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    medium: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  },
};

/**
 * Custom hook to generate base styles for standard buttons.
 * * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} size - The desired size of the button.
 * @returns {Object} An object containing the generated CSS-in-JS styles.
 */
const useBtnStyles = (size = "medium") => {
  const theme = useTheme();

  return useMemo(() => {
    const btnSize = Size.btn[size];
    return {
      minHeight: btnSize.height,
      height: btnSize.height,
      paddingLeft: btnSize.padding.split(" ")[1] || btnSize.padding,
      paddingRight: btnSize.padding.split(" ")[1] || btnSize.padding,
      paddingTop: "0",
      paddingBottom: "0",
      fontSize: btnSize.fontSize,
      fontWeight: btnSize.fontWeight || 500,
      lineHeight: btnSize.lineHeight || 1,
      borderRadius: btnSize.borderRadius || theme.shape.borderRadius,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      textTransform: "none",
      boxSizing: "border-box",
      gap: "8px",
      "& .MuiButton-startIcon, & .MuiButton-endIcon": {
        margin: 0,
        display: "inherit",
        "& > *": {
          fontSize: "1.1em",
        },
      },
    };
  }, [theme, size]);
};

/**
 * A custom Filled Button component (contained variant) with a hover sweep effect.
 * * @param {Object} props - The component props.
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

  const combinedSx = useMemo(
    () => ({
      ...baseStyles,
      position: "relative",
      overflow: "hidden",
      boxShadow: Size.shadow.small,
      "&:hover": {
        boxShadow: Size.shadow.medium,
      },
      "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "150%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        transform: "skewX(-20deg)",
        transition: "left 0.6s ease-in-out",
      },
      "&:hover::after": {
        left: "100%",
      },
      ...sx,
    }),
    [baseStyles, sx]
  );

  return (
    <MUIButton
      variant="contained"
      startIcon={startIcon}
      endIcon={endIcon}
      sx={combinedSx}
      {...props}
    >
      {children}
    </MUIButton>
  );
};

/**
 * A custom Outlined Button component.
 * * @param {Object} props - The component props.
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

  const combinedSx = useMemo(
    () => ({
      ...baseStyles,
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      ...sx,
    }),
    [baseStyles, sx]
  );

  return (
    <MUIButton
      variant="outlined"
      startIcon={startIcon}
      endIcon={endIcon}
      sx={combinedSx}
      {...props}
    >
      {children}
    </MUIButton>
  );
};

/**
 * A custom Text Button component.
 * * @param {Object} props - The component props.
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

  const combinedSx = useMemo(
    () => ({
      ...baseStyles,
      "&:hover": {
        backgroundColor: "rgba(0, 0, 0, 0.04)",
      },
      ...sx,
    }),
    [baseStyles, sx]
  );

  return (
    <MUIButton
      variant="text"
      startIcon={startIcon}
      endIcon={endIcon}
      sx={combinedSx}
      {...props}
    >
      {children}
    </MUIButton>
  );
};

/**
 * Custom hook to generate styles for icon buttons.
 * * @param {('extraSmall'|'small'|'medium'|'large'|'extraLarge')} size - The desired size of the icon button.
 * @returns {Object} An object containing the generated CSS-in-JS styles.
 */
const useIconBtnStyles = (size = "medium") => {
  return useMemo(() => {
    const iconSize = Size.btn.icon[size];
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
  }, [size]);
};

/**
 * A custom Icon Button component with an optional tooltip.
 * * @param {Object} props - The component props.
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

  const combinedSx = useMemo(
    () => ({
      ...baseStyles,
      ...sx,
    }),
    [baseStyles, sx]
  );

  const button = (
    <MUIIconButton sx={combinedSx} {...props}>
      {icon}
    </MUIIconButton>
  );

  return title ? <Tooltip title={title} arrow>{button}</Tooltip> : button;
};