import React from "react";
import PropTypes from "prop-types";
import {
  TextField,
  Autocomplete,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { IconButton } from "./Button";
import { X } from "lucide-react";

/**
 * Custom TextField component with a built-in clear button and standardized styling.
 * @param {Object} props - The component props.
 * @param {string} [props.label] - The label for the input.
 * @param {any} [props.value] - The value of the input.
 * @param {Function} [props.onChange] - Callback fired when the value changes.
 * @param {Function} [props.onBlur] - Callback fired when the input loses focus.
 * @param {string} [props.name] - Name attribute of the input element.
 * @param {string} [props.placeholder] - The short hint displayed in the input before the user enters a value.
 * @param {string} [props.type="text"] - Type of the input element.
 * @param {number} [props.minRows] - Minimum number of rows to display when multiline option is set to true.
 * @param {number} [props.maxRows] - Maximum number of rows to display when multiline option is set to true.
 * @param {boolean} [props.readOnly=false] - If true, the input is read-only.
 * @param {boolean} [props.error] - If true, the label is displayed in an error state.
 * @param {string} [props.helperText] - The helper text content.
 * @param {Object} [props.sx] - Additional MUI system styles to apply to the input.
 * @param {React.ReactNode} [props.endAdornment] - End adornment for the input.
 * @param {Object} [props.slotProps] - The props used for each slot inside the Input.
 * @param {React.Ref} ref - The ref to attach to the input element.
 */
export const AppInput = React.memo(
  React.forwardRef(
    (
      {
        label,
        value,
        onChange,
        onBlur,
        name,
        placeholder,
        type = "text",
        minRows,
        maxRows,
        sx,
        readOnly = false,
        error,
        helperText,
        endAdornment,
        slotProps,
        ...props
      },
      ref
    ) => {
      const theme = useTheme();

      const bgColor =
        theme.palette.surface?.muted || theme.palette.background.paper;

      const inputStyles = {
        fontFamily:
          'Roboto, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
        backgroundColor: bgColor,
        borderRadius: theme.shape.borderRadius,
        "& .MuiInputBase-root": {
          backgroundColor: bgColor,
        },
        "& input[readonly], & textarea[readonly]": {
          cursor: "default",
        },
        "& .MuiInputBase-root:has(input[readonly])": {
          backgroundColor: theme.palette.action.hover,
        },
        "& .MuiOutlinedInput-root:has(input[readonly]) .MuiOutlinedInput-notchedOutline":
          {
            opacity: 0.2,
          },
        ...sx,
      };

      const handleClear = () => {
        if (onChange) {
          onChange({ target: { name, value: "" } });
        }
      };

      const clearButton =
        !endAdornment && value && !readOnly ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              sx={{
                backgroundColor: theme.palette.secondary.main,
                borderRadius: theme.shape.borderRadius,
                width: 32,
                height: 32,
                p: 0,
                "&:hover": {
                  backgroundColor: theme.palette.secondary.dark,
                },
              }}
              icon={<X size={18} />}
              onClick={handleClear}
            />
          </InputAdornment>
        ) : null;

      return (
        <TextField
          {...props}
          fullWidth
          name={name}
          label={label}
          value={value ?? ""}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          type={type}
          inputRef={ref}
          error={error}
          helperText={helperText}
          multiline={!!(minRows || maxRows)}
          minRows={minRows}
          maxRows={maxRows}
          sx={inputStyles}
          slotProps={{
            ...slotProps,
            input: {
              readOnly,
              ...(slotProps?.input || {}),
              endAdornment: endAdornment || clearButton,
            },
          }}
        />
      );
    }
  )
);


AppInput.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  minRows: PropTypes.number,
  maxRows: PropTypes.number,
  readOnly: PropTypes.bool,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  sx: PropTypes.object,
  endAdornment: PropTypes.node,
  slotProps: PropTypes.object,
};

/**
 * Custom Autocomplete component with standardized styling.
 * @param {Object} props - The component props.
 * @param {string} [props.label] - The label for the input.
 * @param {any} [props.value] - The value of the autocomplete.
 * @param {Function} [props.onChange] - Callback fired when the value changes.
 * @param {string} [props.placeholder] - The short hint displayed in the input before the user enters a value.
 * @param {Array} [props.options=[]] - Array of options to be displayed.
 * @param {Object} [props.sx] - Additional MUI system styles to apply to the input.
 * @param {boolean} [props.error] - If true, the label is displayed in an error state.
 * @param {string} [props.helperText] - The helper text content.
 * @param {boolean} [props.fullWidth=true] - If true, the input will take up the full width of its container.
 * @param {React.Ref} ref - The ref to attach to the input element.
 */
export const AppAutoComplete = React.memo(
  React.forwardRef(
    (
      {
        label,
        value,
        onChange,
        options = [],
        placeholder,
        sx,
        error,
        helperText,
        fullWidth = true,
        ...props
      },
      ref
    ) => {
      const theme = useTheme();

      const bgColor =
        theme.palette.surface?.muted || theme.palette.background.paper;
        
      const autocompleteStyles = {
        width: fullWidth ? "100%" : "auto",
        backgroundColor: bgColor,
        borderRadius: theme.shape.borderRadius,
        "& .MuiInputBase-root": { backgroundColor: bgColor },
        ...sx,
      };

      const handleChange = (event, newValue) => {
        if (onChange) {
          onChange({ target: { value: newValue } });
        }
      };

      return (
        <Autocomplete
          fullWidth={fullWidth}
          options={options}
          value={value || (props.multiple ? [] : null)}
          onChange={handleChange}
          getOptionLabel={(option) => {
            if (typeof option === "object" && option !== null) {
              return (option.label || option.name || "").toString();
            }
            return option !== undefined && option !== null
              ? option.toString()
              : "";
          }}
          isOptionEqualToValue={(option, val) => {
            const optVal =
              typeof option === "object" ? option.value || option.id : option;
            const curVal = typeof val === "object" ? val.value || val.id : val;
            return String(optVal) === String(curVal);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder}
              inputRef={ref}
              error={error}
              helperText={helperText}
              fullWidth={fullWidth}
            />
          )}
          sx={autocompleteStyles}
          {...props}
        />
      );
    }
  )
);


AppAutoComplete.propTypes = {
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  options: PropTypes.array,
  sx: PropTypes.object,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  fullWidth: PropTypes.bool,
};