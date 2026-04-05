import { memo } from "react";
import PropTypes from "prop-types";
import { Switch } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledSwitch = styled(Switch)(({ theme }) => {
  const isDark = theme.palette.mode === "dark";

  return {
    width: 36,
    height: 20,
    padding: 0,
    display: "flex",

    "& .MuiSwitch-switchBase": {
      padding: 2,
      transitionDuration: "200ms",

      "&.Mui-checked": {
        transform: "translateX(16px)",
        color: "#fff",

        "& + .MuiSwitch-track": {
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
        },
      },

      "&.Mui-disabled + .MuiSwitch-track": {
        opacity: 0.5,
      },
    },

    "& .MuiSwitch-thumb": {
      width: 16,
      height: 16,
      borderRadius: "50%",
      backgroundColor: "#fff",
      boxShadow: isDark
        ? "0 1px 2px rgba(0,0,0,0.6)"
        : "0 1px 2px rgba(0,0,0,0.3)",
    },

    "& .MuiSwitch-track": {
      borderRadius: 999,
      opacity: 1,
      backgroundColor: isDark
        ? theme.palette.grey[700]
        : theme.palette.grey[300],
      boxSizing: "border-box",
    },
  };
});

/**
 * A custom styled Switch component that overrides MUI's default Switch.
 * Designed with a clean, compact, pill-shaped aesthetic and smooth transitions.
 *
 * @param {Object} props - The component props.
 * @param {boolean} [props.checked] - If true, the switch is set to the on state.
 * @param {Function} [props.onChange] - Callback fired when the state of the switch changes.
 */
export const AppSwitch = memo(({ checked, onChange, ...props }) => {
  return (
    <StyledSwitch
      checked={checked}
      onChange={onChange}
      disableRipple
      {...props}
    />
  );
});


AppSwitch.propTypes = {
  checked: PropTypes.bool,
  onChange: PropTypes.func,
};