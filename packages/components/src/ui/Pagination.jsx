import { useMemo } from "react";
import PropTypes from "prop-types";
import { useTheme, Pagination, Box, alpha } from "@mui/material";

/**
 * A reusable, customized Pagination component built on top of MUI's Pagination.
 * Features custom styling for active, hover, and ellipsis states.
 *
 * @param {Object} props - The component props.
 * @param {number} [props.count=1] - The total number of pages.
 * @param {number} [props.page=1] - The current active page.
 * @param {Function} props.onChange - Callback fired when the page is changed. Passes (event, page) as arguments.
 * @param {boolean} [props.showFirstButton=true] - If true, displays the first-page button.
 * @param {boolean} [props.showLastButton=true] - If true, displays the last-page button.
 * @param {Object} [props.sx={}] - Additional MUI system styles for the outer Box container.
 */
export const AppPagination = ({
  count = 1,
  page = 1,
  onChange,
  showFirstButton = true,
  showLastButton = true,
  sx = {},
  ...props
}) => {
  const theme = useTheme();

  const paginationStyles = useMemo(
    () => ({
      "& .MuiPaginationItem-root": {
        minWidth: 32,
        height: 32,
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
        color: theme.palette.text.primary,
        border: `0.5px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        transition: theme.transitions.create(["background-color", "color"], {
          duration: theme.transitions.duration.shorter,
        }),

        "&:hover": {
          backgroundColor: theme.palette.text.disabled,
        },
      },

      "& .MuiPaginationItem-root.Mui-selected": {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderColor: theme.palette.primary.main,

        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.9),
        },
      },

      "& .MuiPaginationItem-ellipsis": {
        border: "none",
        backgroundColor: "transparent",
      },

      "& .MuiPaginationItem-icon": {
        fontSize: 18,
      },
    }),
    [theme]
  );

  const containerStyles = useMemo(
    () => ({
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      ...sx,
    }),
    [sx]
  );

  return (
    <Box sx={containerStyles}>
      <Pagination
        count={count}
        page={page}
        onChange={onChange}
        showFirstButton={showFirstButton}
        showLastButton={showLastButton}
        shape="rounded"
        sx={paginationStyles}
        {...props}
      />
    </Box>
  );
};

AppPagination.propTypes = {
  count: PropTypes.number,
  page: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  showFirstButton: PropTypes.bool,
  showLastButton: PropTypes.bool,
  sx: PropTypes.object,
};