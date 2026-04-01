import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  useTheme,
  Typography,
  Paper,
  Chip,
  alpha,
  Divider,
  useMediaQuery,
} from "@mui/material";
import {
  AppTable,
  AppInput,
  IconButton,
  AppFlexLayout,
  AppGridLayout,
  AppDialog,
  AppAutoComplete,
  AppSnackBar,
  AppSwitch,
} from "@heykyy/components";
import {
  RotateCcw,
  Hash,
  Calendar,
  Clock,
  Copy,
  Layers,
  Link as LinkIcon,
  AlertTriangle,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  getsCategories,
  deleteCategory,
  updateCategory,
  createCategory,
} from "../../services/category-services";
import { DateUtils } from "@heykyy/utils-frontend";
import { CATEGORY_TYPE } from "@heykyy/constant";

/**
 * Main component for managing the Content Classification Records (Categories).
 * Provides full CRUD operations, advanced filtering, and a detailed view for categories.
 *
 * @returns {JSX.Element} The Categories management dashboard.
 */
const Categories = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [categoryType, setCategoryType] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [hasContentOnly, setHasContentOnly] = useState(undefined);

  const [tempFilter, setTempFilter] = useState({
    type: null,
    sortBy: null,
    hasContentOnly: false,
  });

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openFormDialog, setOpenFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: "",
      type: "",
    },
  });

  const typeOptions = useMemo(() => Object.values(CATEGORY_TYPE), []);
  const sortOptions = useMemo(
    () => [
      { label: "Latest", value: "latest" },
      { label: "Alphabetical", value: "alphabetical" },
    ],
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchVal(searchVal), 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: categoryData,
    isLoading: isTableLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "category",
      pageVal,
      limit,
      categoryType,
      debouncedSearchVal,
      sortBy,
      hasContentOnly,
    ],
    queryFn: () =>
      getsCategories(
        pageVal,
        limit,
        categoryType,
        debouncedSearchVal,
        sortBy,
        hasContentOnly
      ),
    staleTime: 30 * 60 * 1000,
  });

  const rawCategories = useMemo(() => categoryData?.data ?? [], [categoryData]);
  const metadata = useMemo(() => categoryData?.metadata ?? {}, [categoryData]);

  const tableData = useMemo(() => {
    return rawCategories.map((item) => ({
      ...item,
      createdAtFormatted: item.createdAt
        ? DateUtils.formatDateTime(item.createdAt)
        : "-",
      updatedAtFormatted: item.updatedAt
        ? DateUtils.formatDateTime(item.updatedAt)
        : "-",
    }));
  }, [rawCategories]);

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["category"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["category"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (message) => {
      queryClient.invalidateQueries(["category"]);
      setSnackbar({ open: true, message, variant: "success" });
      setOpenDeleteDialog(false);
      setSelectedRow(null);
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const isGlobalLoading = useMemo(
    () =>
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
    [
      createMutation.isPending,
      updateMutation.isPending,
      deleteMutation.isPending,
    ]
  );

  /**
   * Updates the current page value when paginating through the table.
   *
   * @param {Object} _ - The synthetic event (unused).
   * @param {number} value - The newly selected page number.
   */
  const onPageChange = useCallback((_, value) => setPageVal(value), []);

  /**
   * Updates the number of rows displayed per page and resets to the first page.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event containing the new limit.
   */
  const onRowsPerPageChange = useCallback((e) => {
    setLimit(e.target.value);
    setPageVal(1);
  }, []);

  /**
   * Toggles the selection state of a table row. Clicking the same row clears the selection.
   *
   * @param {Object} row - The data object corresponding to the clicked row.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));
  }, []);

  /**
   * Selects a row and automatically opens its detailed view dialog.
   *
   * @param {Object} row - The data object corresponding to the double-clicked row.
   */
  const handleRowDoubleClick = useCallback((row) => {
    setSelectedRow(row);
    setOpenDetailDialog(true);
  }, []);

  /**
   * Updates the active search query, resets pagination to the first page, and clears selected rows.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event containing the search string.
   */
  const handleSearchChange = useCallback((e) => {
    setSearchVal(e.target.value);
    setPageVal(1);
    setSelectedRow(null);
  }, []);

  /**
   * Readies the form dialog for creating a new category by clearing existing data.
   */
  const handleOpenCreate = useCallback(() => {
    setIsEditMode(false);
    reset({ name: "", type: CATEGORY_TYPE.PROJECT });
    setOpenFormDialog(true);
  }, [reset]);

  /**
   * Populates and opens the form dialog to edit the data of an existing category.
   *
   * @param {Object} [row] - The specific row data to edit. Defaults to the currently selected row if omitted.
   */
  const handleOpenEdit = useCallback(
    (row) => {
      const target = row || selectedRow;
      if (!target) return;
      setIsEditMode(true);
      setSelectedRow(target);
      reset({ name: target.name, type: target.type });
      setOpenFormDialog(true);
    },
    [selectedRow, reset]
  );

  /**
   * Closes the creation/edit form dialog and resets all internal form states.
   */
  const handleCloseForm = useCallback(() => {
    setOpenFormDialog(false);
    reset();
  }, [reset]);

  /**
   * Applies the user's temporary filter configurations to the active query and closes the dialog.
   */
  const handleApplyFilter = useCallback(() => {
    setCategoryType(tempFilter.type);
    setSortBy(tempFilter.sortBy);
    setHasContentOnly(tempFilter.hasContentOnly ? true : undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempFilter]);

  /**
   * Resets all filter and sorting states back to their default values and closes the dialog.
   */
  const handleResetFilter = useCallback(() => {
    setTempFilter({ type: null, sortBy: null, hasContentOnly: false });
    setCategoryType(null);
    setSortBy(null);
    setHasContentOnly(undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  /**
   * Submits the processed form data to either create a new category or update the selected one.
   *
   * @param {Object} formData - The validated and complete form data object.
   */
  const onSubmitForm = useCallback(
    (formData) => {
      if (isEditMode && selectedRow?.id) {
        updateMutation.mutate({ id: selectedRow.id, data: formData });
      } else {
        createMutation.mutate(formData);
      }
    },
    [isEditMode, selectedRow?.id, updateMutation, createMutation]
  );

  /**
   * Executes the deletion mutation API call for the targeted category record.
   */
  const onDeleteConfirm = useCallback(() => {
    if (selectedRow?.id) deleteMutation.mutate(selectedRow.id);
  }, [selectedRow?.id, deleteMutation]);

  /**
   * Opens the deletion confirmation dialog for a specific category.
   *
   * @param {Object} row - The data object representing the category to be deleted.
   */
  const handleOpenDelete = useCallback((row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  }, []);

  /**
   * Closes the active snackbar notification explicitly.
   */
  const closeSnackbar = useCallback(
    () => setSnackbar((prev) => ({ ...prev, open: false })),
    []
  );

  /**
   * A local component that renders a standardized informational row, which may include a clipboard copy function.
   *
   * @param {Object} props - The component props.
   * @param {React.ElementType} props.icon - The Lucide icon to display beside the label.
   * @param {string} props.label - The descriptive label text.
   * @param {string|number} props.value - The primary text value to render.
   * @param {boolean} [props.monospace=false] - Applies monospace styling to the value if set to true.
   * @returns {JSX.Element}
   */
  const InfoRow = useCallback(
    ({ icon: Icon, label, value, monospace = false }) => (
      <AppFlexLayout
        gap={2}
        sx={{ py: 1 }}
        align={monospace === true ? "center" : "flex-start"}
      >
        <Box sx={{ color: theme.palette.text.secondary }}>
          <Icon size={18} />
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography variant="caption" display="block" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={monospace ? 600 : 500}
            sx={
              monospace ? { fontFamily: "monospace", fontSize: "0.85rem" } : {}
            }
            noWrap
          >
            {value ?? "-"}
          </Typography>
        </Box>
        {monospace && value && (
          <IconButton
          size="medium"
            onClick={() => navigator.clipboard.writeText(value)}
            icon={<Copy size={14} />}
            sx={{ width: 28, height: 28, p: 0.5 }}
          />
        )}
      </AppFlexLayout>
    ),
    [theme]
  );

  return (
    <>
      <AppTable
        title="Content Classification Records"
        headers={["ID", "Name", "Slug", "Type", "Created At", "Updated At"]}
        data={tableData}
        isLoading={isTableLoading}
        selectedId={selectedRow?.id}
        searchVal={searchVal}
        onSearchChange={handleSearchChange}
        onRefresh={refetch}
        onCreate={handleOpenCreate}
        onUpdate={handleOpenEdit}
        onDelete={handleOpenDelete}
        onFilter={() => {
          setTempFilter({
            type: categoryType,
            sortBy: sortBy,
            hasContentOnly: !!hasContentOnly,
          });
          setOpenFilterDialog(true);
        }}
        count={metadata?.totalPages || 0}
        page={pageVal}
        onChange={onPageChange}
        rowsPerPage={limit}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleRowDoubleClick}
        renderRow={(row) => [
          <Typography
            key="id"
            variant="caption"
            sx={{ fontFamily: "monospace" }}
          >
            {row.id}
          </Typography>,
          <Typography key="name" variant="body2" fontWeight={600}>
            {row.name}
          </Typography>,
          row.slug,
          <Chip
            key="type"
            label={row.type}
            size="small"
            variant="outlined"
            color={row.type === CATEGORY_TYPE.PROJECT ? "primary" : "secondary"}
            sx={{ height: 24, fontSize: "0.7rem", fontWeight: 600 }}
          />,
          row.createdAtFormatted,
          row.updatedAtFormatted,
        ]}
      />

      <AppDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        dialogTitle="Filter Categories"
        maxWidth="xs"
        fullWidth
        actions={[
          { label: "Reset", variant: "outlined", onClick: handleResetFilter },
          { label: "Apply", variant: "filled", onClick: handleApplyFilter },
        ]}
        contentSx={{ p: 0 }}
      >
        <AppFlexLayout direction="column" gap={0} sx={{ width: "100%" }}>
          <Box sx={{ p: 2.5, width: "100%" }}>
            <AppFlexLayout direction="column" gap={3}>
              <AppAutoComplete
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
                label="Type"
                options={typeOptions}
                value={tempFilter.type}
                onChange={(e) =>
                  setTempFilter((prev) => ({ ...prev, type: e.target.value }))
                }
              />
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
                  Has Content Only
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Show only categories with posts
                </Typography>
              </Box>
              <AppSwitch
                checked={tempFilter.hasContentOnly}
                onChange={(e) =>
                  setTempFilter((prev) => ({
                    ...prev,
                    hasContentOnly: e.target.checked,
                  }))
                }
              />
            </AppFlexLayout>
          </Box>
        </AppFlexLayout>
      </AppDialog>

      <AppDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        actions={[
          {
            label: "Close",
            variant: "outlined",
            onClick: () => setOpenDetailDialog(false),
          },
        ]}
      >
        {selectedRow && (
          <Box>
            <AppFlexLayout
              direction="column"
              align="center"
              sx={{
                background: `linear-gradient(180deg, ${alpha(
                  theme.palette.primary.main,
                  0.1
                )} 0%, ${theme.palette.background.paper} 100%)`,
                pt: 4,
                pb: 3,
                px: 3,
                textAlign: "center",
              }}
            >
              <Paper
                elevation={2}
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  color: theme.palette.primary.main,
                }}
              >
                <Layers size={28} />
              </Paper>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                {selectedRow.name}
              </Typography>
              <Chip
                label={selectedRow.type}
                size="small"
                variant="outlined"
                color={
                  selectedRow.type === CATEGORY_TYPE.PROJECT
                    ? "primary"
                    : "secondary"
                }
              />
            </AppFlexLayout>
            <Box sx={{ px: 3, pb: 2 }}>
              <AppGridLayout columns="repeat(2, 1fr)" gap={2} sx={{ mb: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                  }}
                >
                  <AppFlexLayout align="center" gap={2}>
                    <CheckCircle2
                      size={20}
                      color={theme.palette.success.main}
                    />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold">
                        Active
                      </Typography>
                    </Box>
                  </AppFlexLayout>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                  }}
                >
                  <AppFlexLayout align="center" gap={2}>
                    <Tag size={20} color={theme.palette.primary.main} />
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography variant="caption" color="text.secondary">
                        Slug
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        /{selectedRow.slug}
                      </Typography>
                    </Box>
                  </AppFlexLayout>
                </Paper>
              </AppGridLayout>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                System Information
              </Typography>
              <Divider sx={{ my: 2, borderStyle: "dashed" }} />
              <AppFlexLayout direction="column" gap={0.5} align="stretch">
                <InfoRow
                  icon={Hash}
                  label="Category ID"
                  value={selectedRow.id}
                  monospace
                />
                <InfoRow
                  icon={LinkIcon}
                  label="Full Slug"
                  value={selectedRow.slug}
                  monospace
                />
                <AppGridLayout
                  columns={isMobile ? "1fr" : "repeat(2, 1fr)"}
                  sx={{ mt: 1 }}
                >
                  <InfoRow
                    icon={Calendar}
                    label="Created At"
                    value={selectedRow.createdAtFormatted}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Updated At"
                    value={selectedRow.updatedAtFormatted}
                  />
                </AppGridLayout>
              </AppFlexLayout>
            </Box>
          </Box>
        )}
      </AppDialog>

      <AppDialog
        open={openFormDialog}
        onClose={handleCloseForm}
        dialogTitle={isEditMode ? "Edit Category" : "Add Category"}
        maxWidth="sm"
        actions={[
          { label: "Cancel", variant: "outlined", onClick: handleCloseForm },
          {
            label: isEditMode ? "Save Changes" : "Create",
            variant: "filled",
            onClick: handleSubmit(onSubmitForm),
            loading: isGlobalLoading,
          },
        ]}
      >
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <Box sx={{ p: 2 }}>
            <AppFlexLayout direction="column" gap={2.5} align="stretch">
              <Controller
                name="name"
                control={control}
                rules={{ required: "Required" }}
                render={({ field, fieldState: { error } }) => (
                  <AppInput
                    label="Category Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="type"
                control={control}
                rules={{ required: "Required" }}
                render={({ field, fieldState: { error } }) => (
                  <AppAutoComplete
                    label="Type"
                    options={typeOptions}
                    error={!!error}
                    helperText={error?.message}
                    {...field}
                  />
                )}
              />
            </AppFlexLayout>
          </Box>
        </form>
      </AppDialog>

      <AppDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        actions={[
          {
            label: "Cancel",
            variant: "outlined",
            onClick: () => setOpenDeleteDialog(false),
          },
          {
            label: "Delete",
            variant: "contained",
            color: "error",
            onClick: onDeleteConfirm,
            loading: isGlobalLoading,
          },
        ]}
      >
        <Box sx={{ py: 3, textAlign: "center" }}>
          <AlertTriangle
            size={48}
            color={theme.palette.error.main}
            style={{ marginBottom: 16 }}
          />
          <Typography variant="h6">Delete Category?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Delete <b>{selectedRow?.name}</b>?
          </Typography>
        </Box>
      </AppDialog>

      <AppSnackBar
        open={snackbar.open}
        message={snackbar.message}
        variant={snackbar.variant}
        onClose={closeSnackbar}
      />
    </>
  );
};

export default React.memo(Categories);