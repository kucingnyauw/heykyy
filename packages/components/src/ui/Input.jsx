import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  TextField,
  Autocomplete,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { IconButton } from "./Button";
import { X } from "lucide-react";

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

      const inputStyles = useMemo(() => {
        const bgColor =
          theme.palette.surface?.muted || theme.palette.background.paper;

        return {
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
      }, [theme, sx]);

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

AppInput.displayName = "AppInput";
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

      const autocompleteStyles = useMemo(() => {
        const bgColor =
          theme.palette.surface?.muted || theme.palette.background.paper;
        return {
          width: fullWidth ? "100%" : "auto",
          backgroundColor: bgColor,
          borderRadius: theme.shape.borderRadius,
          "& .MuiInputBase-root": { backgroundColor: bgColor },
          ...sx,
        };
      }, [theme, sx, fullWidth]);

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
            return option !== undefined && option !== null ? option.toString() : "";
          }}
          isOptionEqualToValue={(option, val) => {
            const optVal = typeof option === "object" ? option.value || option.id : option;
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

AppAutoComplete.displayName = "AppAutoComplete";
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