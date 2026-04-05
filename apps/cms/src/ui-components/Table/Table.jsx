import { memo } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Skeleton,
  useTheme,
  Pagination,
  alpha,
  Box,
  Typography,
  Card,
  Divider,
  useMediaQuery,
} from "@mui/material";

import { RotateCcw, Plus, ListFilter, Pencil, Trash2 } from "lucide-react";
import {
  IconButton,
  AppFlexLayout,
  FilledButton,
  AppAutoComplete,
  AppInput,
} from "@heykyy/components";

/**
 * A reusable, custom Table component with built-in features such as
 * pagination, searching, filtering, and CRUD actions.
 *
 * @param {Object} props - The component props.
 * @param {string} [props.title] - The title displayed at the top of the table.
 * @param {string[]} [props.headers=[]] - Array of string labels for the table headers.
 * @param {Object[]} [props.data=[]] - Array of objects representing the table data rows.
 * @param {Function} [props.renderRow] - Optional custom render function for mapping row data to table cells.
 * @param {string|number} [props.selectedId] - The ID of the currently selected row for highlighting.
 * @param {string} [props.searchVal] - The current value of the search input.
 * @param {Function} [props.onRefresh] - Callback function triggered when the refresh icon is clicked.
 * @param {Function} [props.onCreate] - Callback function triggered when the 'Create new' button is clicked.
 * @param {Function} [props.onUpdate] - Callback function triggered when the edit icon is clicked on a row.
 * @param {Function} [props.onFilter] - Callback function triggered when the filter icon is clicked.
 * @param {Function} [props.onDelete] - Callback function triggered when the delete icon is clicked on a row.
 * @param {Function} [props.onSearchChange] - Callback function triggered when the search input value changes.
 * @param {Function} [props.onRowClick] - Callback function triggered when a table row is clicked.
 * @param {Function} [props.onRowDoubleClick] - Callback function triggered when a table row is double-clicked.
 * @param {number} [props.minWidth=800] - Minimum width of the table to enforce horizontal scrolling.
 * @param {Object} [props.sx={}] - Custom MUI system styles for the outer Card container.
 * @param {Object} [props.tableSx] - Custom MUI system styles applied directly to the Table component.
 * @param {boolean} [props.isLoading=false] - Whether the table is in a loading state (displays skeletons).
 * @param {number} [props.rowsSkeletonCount=5] - Number of skeleton rows to display while loading.
 * @param {number} [props.count] - Total number of pages for the Pagination component.
 * @param {number} [props.page=1] - The current active page number.
 * @param {Function} [props.onChange] - Callback function triggered when the active page changes.
 * @param {number} [props.rowsPerPage=5] - The current number of rows displayed per page.
 * @param {Function} [props.onRowsPerPageChange] - Callback function triggered when rows per page selection changes.
 * @param {number[]} [props.rowsPerPageOptions=[5, 10, 25, 50]] - Available options for the rows per page dropdown.
 */
export const CustomTable = memo(
  ({
    title,
    headers = [],
    data = [],
    renderRow,
    selectedId,
    searchVal,
    onRefresh,
    onCreate,
    onUpdate,
    onFilter,
    onDelete,
    onSearchChange,
    onRowClick,
    onRowDoubleClick,
    minWidth = 800,
    sx = {},
    isLoading = false,
    rowsSkeletonCount = 5,
    count,
    page = 1,
    onChange,
    rowsPerPage = 5,
    onRowsPerPageChange,
    rowsPerPageOptions = [5, 10, 25, 50],
    tableSx,
    ...props
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const hasActions = Boolean(onUpdate || onDelete);

    const iconBtnSx = {
      borderRadius: theme.shape.borderRadius,
      backgroundColor: theme.palette.background.paper,
      border: `0.5px solid ${theme.palette.divider}`,
      transition: theme.transitions.create(["background-color", "transform"]),
      "&:hover": {
        backgroundColor:
          theme.palette.custom?.surface?.muted ||
          alpha(theme.palette.divider, 0.1),
      },
    };

    const finalHeaders = ["No", ...headers];
    if (hasActions) finalHeaders.push("Actions");

    const paginationStyles = {
      "& .MuiPaginationItem-root": {
        minWidth: 32,
        height: 32,
        borderRadius: theme.shape.borderRadius,
        fontSize: theme.typography.fontSize,
        color: theme.palette.text.primary,
        border: "1px solid transparent",
        backgroundColor: "transparent",
        transition: theme.transitions.create([
          "background-color",
          "border-color",
        ]),
        "&:hover": {
          backgroundColor:
            theme.palette.custom?.surface?.muted ||
            alpha(theme.palette.divider, 0.1),
        },
      },
      "& .MuiPaginationItem-root.Mui-selected": {
        backgroundColor: "transparent",
        color: theme.palette.text.primary,
        border: `1px solid ${theme.palette.divider}`,
        fontWeight: 500,
        "&:hover": {
          backgroundColor:
            theme.palette.custom?.surface?.muted ||
            alpha(theme.palette.divider, 0.1),
        },
      },
      "& .MuiPaginationItem-ellipsis": {
        border: "none",
        backgroundColor: "transparent",
      },
      "& .MuiPaginationItem-icon": {
        fontSize: 16,
      },
    };

    const handleUpdate = (e, row) => {
      e.stopPropagation();
      if (onUpdate) onUpdate(row);
    };

    const handleDelete = (e, row) => {
      e.stopPropagation();
      if (onDelete) onDelete(row);
    };

    const renderedHeaders = (
      <TableRow
        sx={{
          backgroundColor:
            theme.palette.custom?.surface?.muted ||
            alpha(theme.palette.divider, 0.04),
        }}
      >
        {finalHeaders.map((header, idx) => (
          <TableCell
            key={idx}
            sx={{
              fontWeight: 500,
              color: theme.palette.text.secondary,
              whiteSpace: "nowrap",
              borderBottom: `1px solid ${theme.palette.divider}`,
              py: 2,
              px: { xs: 2, sm: 3 },
              height: 48,
              width: idx === 0 ? 60 : "auto",
              textAlign:
                idx === 0 || idx === finalHeaders.length - 1
                  ? "center"
                  : "left",
            }}
          >
            {header}
          </TableCell>
        ))}
      </TableRow>
    );

    const renderedSkeletons = Array.from({ length: rowsSkeletonCount }).map(
      (_, idx) => (
        <TableRow key={`skeleton-${idx}`}>
          {finalHeaders.map((_, i) => (
            <TableCell
              key={`cell-skeleton-${i}`}
              sx={{
                px: { xs: 2, sm: 3 },
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Skeleton variant="text" animation="wave" height={24} />
            </TableCell>
          ))}
        </TableRow>
      )
    );

    let renderedRows;
    if (data.length === 0) {
      renderedRows = (
        <TableRow>
          <TableCell
            colSpan={finalHeaders.length}
            align="center"
            sx={{ py: 8, borderBottom: "none" }}
          >
            <Typography variant="body2" color="text.secondary">
              No data found.
            </Typography>
          </TableCell>
        </TableRow>
      );
    } else {
      renderedRows = data.map((row, idx) => {
        const rowId = row.id ?? idx;
        const isSelected = selectedId === rowId;
        const rowNumber = (page - 1) * rowsPerPage + idx + 1;
        const cells = renderRow ? renderRow(row) : Object.values(row);

        return (
          <TableRow
            key={rowId}
            hover
            onClick={() => onRowClick?.(row)}
            onDoubleClick={() => onRowDoubleClick?.(row)}
            sx={{
              cursor: onRowClick || onRowDoubleClick ? "pointer" : "default",
              backgroundColor: isSelected
                ? theme.palette.custom?.surface?.muted ||
                  alpha(theme.palette.divider, 0.05)
                : "transparent",
              transition: theme.transitions.create("background-color"),
              "&:hover": {
                backgroundColor:
                  theme.palette.custom?.surface?.muted ||
                  alpha(theme.palette.divider, 0.1),
              },
              "& > td": {
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <TableCell
              align="center"
              sx={{ px: { xs: 2, sm: 3 }, py: 2.5, color: "text.secondary" }}
            >
              {rowNumber}
            </TableCell>

            {cells.map((val, i) => (
              <TableCell
                key={i}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {val}
              </TableCell>
            ))}

            {hasActions && (
              <TableCell align="center" sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
                <AppFlexLayout gap={1} justify="center">
                  {onUpdate && (
                    <IconButton
                      size="extraSmall"
                      title="Edit"
                      icon={<Pencil size={16} />}
                      sx={iconBtnSx}
                      onClick={(e) => handleUpdate(e, row)}
                    />
                  )}
                  {onDelete && (
                    <IconButton
                      size="extraSmall"
                      color="error"
                      title="Delete"
                      icon={<Trash2 size={16} />}
                      sx={iconBtnSx}
                      onClick={(e) => handleDelete(e, row)}
                    />
                  )}
                </AppFlexLayout>
              </TableCell>
            )}
          </TableRow>
        );
      });
    }

    return (
      <Card
        sx={{
          width: "100%",
          borderRadius: theme.shape.borderRadius,
          overflow: "hidden",
          ...sx,
        }}
      >
        {(title || onSearchChange || onRefresh || onFilter || onCreate) && (
          <>
            <AppFlexLayout
              justify="space-between"
              align={{ xs: "flex-start", sm: "center" }}
              sx={{
                p: { xs: 2.5, sm: 2 },
                gap: 3,
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              {title && (
                <Box sx={{ width: { xs: "100%", md: "auto" } }}>
                  <Typography variant="h6" component="h3">
                    {title}
                  </Typography>
                </Box>
              )}

              {(onSearchChange || onRefresh || onFilter || onCreate) && (
                <AppFlexLayout
                  gap={2}
                  align={{ xs: "stretch", sm: "center" }}
                  justify={{ xs: "flex-start", md: "flex-end" }}
                  sx={{
                    width: { xs: "100%", md: "auto" },
                    flexDirection: { xs: "column", sm: "row" },
                    flex: 1,
                  }}
                >
                  {onSearchChange && (
                    <Box sx={{ flex: { xs: "1 1 auto", sm: "0 1 auto" } }}>
                      {isLoading ? (
                        <Skeleton variant="rounded" width="100%" height={40} />
                      ) : (
                        <AppInput
                          placeholder="Search..."
                          value={searchVal}
                          onChange={onSearchChange}
                          sx={{ width: { xs: "100%", sm: 320, md: 280 } }}
                        />
                      )}
                    </Box>
                  )}

                  <AppFlexLayout
                    gap={1.5}
                    align="center"
                    justify={{ xs: "space-between", sm: "flex-end" }}
                  >
                    {isLoading ? (
                      <Skeleton variant="rounded" width={100} height={32} />
                    ) : (
                      <>
                        <AppFlexLayout gap={1.5}>
                          {onFilter && (
                            <IconButton
                              icon={<ListFilter size={18} />}
                              onClick={onFilter}
                              size="extraSmall"
                              title="Filter"
                              sx={iconBtnSx}
                            />
                          )}
                          {onRefresh && (
                            <IconButton
                              icon={<RotateCcw size={18} />}
                              onClick={onRefresh}
                              size="extraSmall"
                              title="Refresh"
                              sx={iconBtnSx}
                            />
                          )}
                        </AppFlexLayout>
                        {onCreate && (
                          <FilledButton
                            startIcon={<Plus size={16} />}
                            onClick={onCreate}
                            size="extraSmall"
                          >
                            Create new
                          </FilledButton>
                        )}
                      </>
                    )}
                  </AppFlexLayout>
                </AppFlexLayout>
              )}
            </AppFlexLayout>
            <Divider />
          </>
        )}

        <TableContainer sx={{ width: "100%", overflowX: "auto" }}>
          <Table sx={{ minWidth, ...tableSx }} {...props}>
            <TableHead>{renderedHeaders}</TableHead>
            <TableBody>
              {isLoading ? renderedSkeletons : renderedRows}
            </TableBody>
          </Table>
        </TableContainer>

        {(isLoading || (count && count > 0)) && (
          <>
            <Divider />
            <AppFlexLayout
              justify={{ xs: "center", sm: "space-between" }}
              align={{ xs: "center", sm: "center" }}
              sx={{
                p: { xs: 2.5, sm: 3 },
                gap: 3,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              {onRowsPerPageChange ? (
                <AppFlexLayout align="center" gap={2}>
                  {isLoading ? (
                    <Skeleton variant="text" width={120} height={36} />
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Rows per page:
                      </Typography>
                      <AppAutoComplete
                        options={rowsPerPageOptions}
                        value={rowsPerPage}
                        onChange={onRowsPerPageChange}
                        disableClearable
                        sx={{
                          width: 80,
                          "& .MuiInputBase-root": {
                            height: 36,
                            fontSize: "0.875rem",
                            p: "0 !important",
                          },
                          "& .MuiOutlinedInput-input": {
                            p: "6px 10px !important",
                          },
                        }}
                      />
                    </>
                  )}
                </AppFlexLayout>
              ) : (
                <Box sx={{ display: { xs: "none", sm: "block" } }} />
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", sm: "flex-end" },
                  flex: 1,
                }}
              >
                {isLoading ? (
                  <Skeleton variant="rounded" width={200} height={32} />
                ) : (
                  <Pagination
                    count={count}
                    page={page}
                    onChange={onChange}
                    showFirstButton
                    showLastButton
                    shape="rounded"
                    size={isMobile ? "small" : "medium"}
                    sx={paginationStyles}
                  />
                )}
              </Box>
            </AppFlexLayout>
          </>
        )}
      </Card>
    );
  }
);


CustomTable.propTypes = {
  title: PropTypes.string,
  headers: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf(PropTypes.object),
  renderRow: PropTypes.func,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  searchVal: PropTypes.string,
  onRefresh: PropTypes.func,
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onFilter: PropTypes.func,
  onDelete: PropTypes.func,
  onSearchChange: PropTypes.func,
  onRowClick: PropTypes.func,
  onRowDoubleClick: PropTypes.func,
  minWidth: PropTypes.number,
  sx: PropTypes.object,
  tableSx: PropTypes.object,
  isLoading: PropTypes.bool,
  rowsSkeletonCount: PropTypes.number,
  count: PropTypes.number,
  page: PropTypes.number,
  onChange: PropTypes.func,
  rowsPerPage: PropTypes.number,
  onRowsPerPageChange: PropTypes.func,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number),
};