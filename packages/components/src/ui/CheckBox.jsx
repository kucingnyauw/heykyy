import React from "react";
import PropTypes from "prop-types";
import { Checkbox, FormControlLabel, useTheme, alpha } from "@mui/material";
import { Check } from "lucide-react";

/**
 * A custom styled Checkbox component with an optional label.
 * Features a modern, rounded-square design with customizable sizing and theme-aware colors.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.value - If true, the component is checked.
 * @param {Function} [props.onChange] - Callback fired when the state of the checkbox changes.
 * @param {React.ReactNode} [props.label] - The text or element to be used as the label.
 * @param {('end'|'start'|'top'|'bottom')} [props.labelPlacement="end"] - The position of the label relative to the checkbox.
 * @param {Object} [props.labelSx={}] - Additional MUI system styles for the label Typography.
 * @param {Object} [props.sx={}] - Additional MUI system styles for the Checkbox component.
 * @param {number} [props.size=18] - The size of the checkbox icon in pixels.
 */
export const AppCheckBox = ({
  value,
  onChange,
  label,
  labelPlacement = "end",
  labelSx = {},
  sx = {},
  size = 18,
  ...props
}) => {
  const theme = useTheme();

  const border = theme.palette.custom?.border?.default || theme.palette.divider;
  const muted = theme.palette.custom?.surface?.muted || theme.palette.action.hover;
  const primary = alpha(theme.palette.primary.main, 0.6);

  const iconStyles = {
    width: size,
    height: size,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: theme.transitions.create(["all"]),
  };

  const checkboxSx = {
    padding: "4px",
    "&:hover": {
      backgroundColor: "transparent",
    },
    "&:focus-visible span": {
      outline: `3px solid ${alpha(primary, 0.25)}`,
      outlineOffset: 2,
    },
    ...sx,
  };

  const defaultIcon = (
    <span
      style={{
        ...iconStyles,
        border: `1px solid ${border}`,
        background: muted,
      }}
    />
  );

  const checkedIcon = (
    <span
      style={{
        ...iconStyles,
        border: `1px solid ${primary}`,
        background: primary,
      }}
    >
      <Check
        size={size - 4}
        strokeWidth={3}
        color={theme.palette.primary.contrastText}
      />
    </span>
  );

  const checkbox = (
    <Checkbox
      checked={value}
      onChange={onChange}
      disableRipple
      icon={defaultIcon}
      checkedIcon={checkedIcon}
      sx={checkboxSx}
      {...props}
    />
  );

  if (!label) return checkbox;

  return (
    <FormControlLabel
      control={checkbox}
      label={label}
      labelPlacement={labelPlacement}
      sx={{
        margin: 0,
        gap: 1,
        "& .MuiFormControlLabel-label": {
          ...labelSx,
        },
      }}
    />
  );
};

AppCheckBox.propTypes = {
  value: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.node,
  labelPlacement: PropTypes.oneOf(["end", "start", "top", "bottom"]),
  labelSx: PropTypes.object,
  sx: PropTypes.object,
  size: PropTypes.number,
};