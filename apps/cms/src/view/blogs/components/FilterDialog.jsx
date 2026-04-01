import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import {
  AppDialog,
  AppFlexLayout,
  AppAutoComplete,
  AppSwitch,
} from "@heykyy/components";
import { BLOG_STATUS } from "@heykyy/constant";
import CategoryDropdown from "../../../ui-components/CategoryList";

/**
 * FilterDialog Component for filtering blogs based on various criteria.
 * * @param {Object} props - Component props
 * @param {boolean} props.open - Controls the visibility of the dialog
 * @param {Function} props.onClose - Function to close the dialog
 * @param {Object} props.tempFilter - Temporary filter state before applying
 * @param {Function} props.setTempFilter - State setter for temporary filters
 * @param {Function} props.onApply - Function to apply the selected filters
 * @param {Function} props.onReset - Function to reset the filters
 * @param {Array<{label: string, value: string}>} props.sortOptions - Options for sorting
 * @returns {JSX.Element} The FilterDialog component
 */
const FilterDialog = ({
  open,
  onClose,
  tempFilter,
  setTempFilter,
  onApply,
  onReset,
  sortOptions,
}) => {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      dialogTitle="Filter Blogs"
      maxWidth="xs"
      fullWidth
      actions={[
        { label: "Reset", variant: "outlined", onClick: onReset },
        { label: "Apply", variant: "filled", onClick: onApply },
      ]}
      contentSx={{ p: 0 }}
    >
      <AppFlexLayout direction="column" gap={0} sx={{ width: "100%" }}>
        <Box sx={{ p: 2.5, width: "100%" }}>
          <AppFlexLayout direction="column" gap={3} sx={{ width: "100%" }}>
            <AppAutoComplete
              fullWidth
              label="Sort By"
              options={sortOptions}
              value={
                sortOptions.find((o) => o.value === tempFilter.sortBy) || null
              }
              onChange={(e) =>
                setTempFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value?.value || null,
                }))
              }
            />
            <AppAutoComplete
              fullWidth
              label="Status"
              options={Object.values(BLOG_STATUS)}
              value={tempFilter.status}
              onChange={(e) =>
                setTempFilter((prev) => ({ ...prev, status: e.target.value }))
              }
            />
            <CategoryDropdown
              type="blog"
              label="Category"
              value={tempFilter.categoryId}
              onChange={(val) =>
                setTempFilter((prev) => ({ ...prev, categoryId: val }))
              }
            />
          </AppFlexLayout>
        </Box>
        <Divider />
        <Box sx={{ p: 2.5, width: "100%" }}>
          <AppFlexLayout justify="space-between" align="center">
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Featured Posts Only
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Show only promoted blogs
              </Typography>
            </Box>
            <AppSwitch
              checked={tempFilter.isFeatured}
              onChange={(e) =>
                setTempFilter((prev) => ({
                  ...prev,
                  isFeatured: e.target.checked,
                }))
              }
            />
          </AppFlexLayout>
        </Box>
      </AppFlexLayout>
    </AppDialog>
  );
};

export default FilterDialog;
