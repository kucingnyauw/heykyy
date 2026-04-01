import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import {
  AppDialog,
  AppFlexLayout,
  AppAutoComplete,
  AppSwitch,
} from "@heykyy/components";
import { PROJECT_STATUS } from "@heykyy/constant";
import { ChevronRight } from "lucide-react";
import CategoryDropdown from "../../../ui-components/CategoryList";

/**
 * Dialog component for filtering the project portfolio based on multiple criteria.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.open - Determines if the dialog is visible.
 * @param {Function} props.onClose - Callback triggered to close the dialog.
 * @param {Object} props.tempFilter - Temporary state holding the filter values before applying.
 * @param {Function} props.setTempFilter - State setter for the temporary filter values.
 * @param {Function} props.onApply - Callback triggered when the apply button is clicked.
 * @param {Function} props.onReset - Callback triggered when the reset button is clicked.
 * @param {Array<{label: string, value: string}>} props.sortOptions - Available options for sorting the data.
 * @param {Function} props.onOpenStack - Callback to open the tech stack selection dialog.
 * @returns {JSX.Element} The FilterDialog component.
 */
const FilterDialog = ({
  open,
  onClose,
  tempFilter,
  setTempFilter,
  onApply,
  onReset,
  sortOptions,
  onOpenStack,
}) => {
  return (
    <AppDialog
      open={open}
      onClose={onClose}
      dialogTitle="Filter Projects"
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
          <AppFlexLayout direction="column" gap={3}>
            <AppAutoComplete
              label="Sort By"
              options={sortOptions}
              value={sortOptions.find((o) => o.value === tempFilter.sortBy) || null}
              onChange={(e) =>
                setTempFilter((prev) => ({
                  ...prev,
                  sortBy: e.target.value?.value || null,
                }))
              }
            />
            <AppAutoComplete
              label="Status"
              options={Object.values(PROJECT_STATUS)}
              value={tempFilter.status}
              onChange={(e) =>
                setTempFilter((prev) => ({ ...prev, status: e.target.value }))
              }
            />
            <CategoryDropdown
              type="project"
              label="Category"
              value={tempFilter.categoryId}
              onChange={(val) =>
                setTempFilter((prev) => ({ ...prev, categoryId: val }))
              }
            />

            <Box
              onClick={onOpenStack}
              sx={{ cursor: "pointer", width: "100%" }}
            >
              <AppAutoComplete
                label="Tech Stack"
                fullWidth
                readOnly
                placeholder="Select technology"
                value={
                  tempFilter.stack
                    ? {
                        label: tempFilter.stack.name,
                        value: tempFilter.stack.id,
                      }
                    : null
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <ChevronRight
                        size={18}
                        style={{ marginRight: 8, opacity: 0.5 }}
                      />
                    ),
                  },
                }}
              />
            </Box>
          </AppFlexLayout>
        </Box>
        <Divider />
        <Box
          sx={{
            p: 2.5,
            width: "100%",
          }}
        >
          <AppFlexLayout justify="space-between" align="center">
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Featured Projects Only
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Show only promoted portfolio
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