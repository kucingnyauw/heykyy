import { useMemo } from "react";
import PropTypes from "prop-types";
import { Popper, Paper, ClickAwayListener, useTheme } from "@mui/material";

/**
 * A reusable custom Popper component utilizing MUI's Popper and ClickAwayListener.
 * Ideal for creating floating UI elements like dropdowns, menus, or custom tooltips that need to close when clicking outside.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.open - Controls the visibility of the popper.
 * @param {HTMLElement|Object|null} props.anchorEl - The HTML element, or a reference to it, used to set the position of the popper.
 * @param {Function} props.onClose - Callback fired when a click is detected outside the popper content.
 * @param {React.ReactNode} [props.children] - The content to be rendered inside the popper.
 * @param {string} [props.placement="bottom-start"] - Popper placement relative to the anchor element.
 * @param {number[]} [props.offset=[0, 6]] - The displacement of the popper [skidding, distance] from its anchor.
 * @param {Object} [props.sx={}] - Additional MUI system styles to apply to the Paper container.
 */
export const AppPopper = ({
  open,
  anchorEl,
  onClose,
  children,
  placement = "bottom-start",
  offset = [0, 6],
  sx = {},
}) => {
  const theme = useTheme();

  const modifiers = useMemo(
    () => [
      {
        name: "offset",
        options: { offset },
      },
      {
        name: "flip",
        enabled: true,
      },
      {
        name: "preventOverflow",
        enabled: true,
        options: {
          boundary: "viewport",
        },
      },
    ],
    [offset]
  );

  const popperContent = useMemo(
    () => (
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: theme.shape.borderRadius,
            border: `0.5px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper,
            p: 0.75,
            minWidth: 180,
            transition: theme.transitions.create(["opacity", "transform"], {
              duration: 120,
            }),
            ...sx,
          }}
        >
          {children}
        </Paper>
      </ClickAwayListener>
    ),
    [onClose, theme, children, sx]
  );

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={placement}
      modifiers={modifiers}
      popperOptions={{
        strategy: "fixed",
      }}
      sx={{ zIndex: theme.zIndex.modal }}
    >
      {popperContent}
    </Popper>
  );
};

AppPopper.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.any,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node,
  placement: PropTypes.string,
  offset: PropTypes.arrayOf(PropTypes.number),
  sx: PropTypes.object,
};