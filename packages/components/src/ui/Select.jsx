import { useMemo } from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

/**
 * A reusable Select (dropdown) component built on top of MUI's FormControl and Select.
 * Automatically handles the generation of an empty "None" option and maps through a provided options array.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.label] - The label displayed for the select input.
 * @param {any} [props.value] - The currently selected value.
 * @param {Function} [props.onChange] - Callback fired when a menu item is selected.
 * @param {Array<{label: React.ReactNode, value: any}>} props.options - Array of option objects to populate the dropdown menu.
 * @param {Object} [props.sx] - Additional MUI system styles to apply to the outer FormControl wrapper.
 */
export const AppSelect = ({
  label,
  value,
  onChange,
  options = [],
  sx,
  ...props
}) => {
  const labelId = useMemo(
    () => (label ? `${label.replace(/\s+/g, "-")}-label` : undefined),
    [label]
  );

  const renderedOptions = useMemo(
    () => [
      <MenuItem key="none" value="">
        <em>None</em>
      </MenuItem>,
      ...options.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      )),
    ],
    [options]
  );

  return (
    <FormControl
      sx={{
        m: 1,
        minWidth: 80,
        ...sx,
      }}
    >
      {label && <InputLabel id={labelId}>{label}</InputLabel>}

      <Select
        labelId={labelId}
        value={value ?? ""}
        onChange={onChange}
        autoWidth
        label={label}
        {...props}
      >
        {renderedOptions}
      </Select>
    </FormControl>
  );
};

AppSelect.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  sx: PropTypes.object,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      value: PropTypes.any,
    })
  ).isRequired,
};