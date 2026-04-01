import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  useTheme,
  Typography,
  Paper,
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
  AppSnackBar,
  AppSwitch,
} from "@heykyy/components";
import {
  Hash,
  Calendar,
  Clock,
  ExternalLink,
  Globe,
  AlertTriangle,
  Link as LinkIcon,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getsTech,
  deleteTech,
  updateTech,
  createTech,
} from "../../services/tech-service";
import { DateUtils } from "@heykyy/utils-frontend";
import { useForm, Controller } from "react-hook-form";

/**
 * Main component for managing the Technology Stack Inventory.
 * Provides a table interface with create, read, update, delete, and filtering functionalities.
 *
 * @returns {JSX.Element} The technology stack management dashboard.
 */
const Techs = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [hasProjectOnly, setHasProjectOnly] = useState(undefined);
  const [tempHasProjectOnly, setTempHasProjectOnly] = useState(false);

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
      icon: "",
      url: "",
    },
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchVal(searchVal), 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: techData,
    isLoading: isTableLoading,
    refetch,
  } = useQuery({
    queryKey: ["tech", pageVal, limit, debouncedSearchVal, hasProjectOnly],
    queryFn: () => getsTech(pageVal, limit, debouncedSearchVal, hasProjectOnly),
    staleTime: 30 * 60 * 1000,
  });

  const rawTechs = useMemo(() => techData?.data ?? [], [techData]);
  const metadata = useMemo(() => techData?.metadata ?? {}, [techData]);

  const tableData = useMemo(() => {
    return rawTechs.map((item) => ({
      ...item,
      createdAtFormatted: item.createdAt
        ? DateUtils.formatDateTime(item.createdAt)
        : "-",
      updatedAtFormatted: item.updatedAt
        ? DateUtils.formatDateTime(item.updatedAt)
        : "-",
    }));
  }, [rawTechs]);

  const createMutation = useMutation({
    mutationFn: createTech,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["tech"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTech(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["tech"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTech,
    onSuccess: (message) => {
      queryClient.invalidateQueries(["tech"]);
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
   * Updates the current page value when pagination controls are interacted with.
   *
   * @param {Object} _ - The event object (unused).
   * @param {number} value - The new page number.
   */
  const onPageChange = useCallback((_, value) => setPageVal(value), []);

  /**
   * Updates the number of items displayed per page and resets the current page to 1.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const onRowsPerPageChange = useCallback((e) => {
    setLimit(e.target.value);
    setPageVal(1);
  }, []);

  /**
   * Toggles the selection of a table row.
   *
   * @param {Object} row - The data object of the clicked row.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));
  }, []);

  /**
   * Selects a row and opens the detailed view dialog.
   *
   * @param {Object} row - The data object of the double-clicked row.
   */
  const handleRowDoubleClick = useCallback((row) => {
    setSelectedRow(row);
    setOpenDetailDialog(true);
  }, []);

  /**
   * Updates the search value and resets the pagination to the first page.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = useCallback((e) => {
    setSearchVal(e.target.value);
    setPageVal(1);
    setSelectedRow(null);
  }, []);

  /**
   * Opens the technology form dialog in creation mode and clears existing inputs.
   */
  const handleOpenCreate = useCallback(() => {
    setIsEditMode(false);
    reset({ name: "", icon: "", url: "" });
    setOpenFormDialog(true);
  }, [reset]);

  /**
   * Opens the technology form dialog in edit mode and populates it with the selected row's data.
   *
   * @param {Object} [row] - The specific row to edit, defaults to the currently selected row if omitted.
   */
  const handleOpenEdit = useCallback(
    (row) => {
      const target = row || selectedRow;
      if (!target) return;
      setIsEditMode(true);
      setSelectedRow(target);
      reset({
        name: target.name,
        icon: target.icon,
        url: target.url,
      });
      setOpenFormDialog(true);
    },
    [selectedRow, reset]
  );

  /**
   * Closes the technology form dialog and resets the form state.
   */
  const handleCloseForm = useCallback(() => {
    setOpenFormDialog(false);
    reset();
  }, [reset]);

  /**
   * Applies the selected filter configurations to the data query and resets pagination.
   */
  const handleApplyFilter = useCallback(() => {
    setHasProjectOnly(tempHasProjectOnly ? true : undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempHasProjectOnly]);

  /**
   * Clears all active filters, reverting to the default data view.
   */
  const handleResetFilter = useCallback(() => {
    setTempHasProjectOnly(false);
    setHasProjectOnly(undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  /**
   * Submits the form data to either create a new technology or update an existing one based on the current mode.
   *
   * @param {Object} formData - The validated data from React Hook Form.
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
   * Triggers the deletion mutation for the currently selected technology.
   */
  const onDeleteConfirm = useCallback(() => {
    if (selectedRow?.id) deleteMutation.mutate(selectedRow.id);
  }, [selectedRow?.id, deleteMutation]);

  /**
   * Sets the specified row as selected and opens the deletion confirmation dialog.
   *
   * @param {Object} row - The data object of the row to be deleted.
   */
  const handleOpenDelete = useCallback((row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  }, []);

  /**
   * Closes the active snackbar notification.
   */
  const closeSnackbar = useCallback(
    () => setSnackbar((prev) => ({ ...prev, open: false })),
    []
  );

  /**
   * Local component for displaying key-value pairs with an optional copy-to-clipboard button.
   *
   * @param {Object} props - Component properties.
   * @param {React.ElementType} props.icon - The Lucide icon component to display.
   * @param {string} props.label - The descriptive label for the row.
   * @param {string|number} props.value - The main value to display.
   * @param {boolean} [props.monospace=false] - If true, formats the value with a monospace font.
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
        title="Technology Stack Inventory"
        headers={["ID", "Icon", "Name", "Link", "Created At", "Updated At"]}
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
          setTempHasProjectOnly(!!hasProjectOnly);
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
            color="text.secondary"
            sx={{ fontFamily: "monospace" }}
          >
            {row.id}
          </Typography>,
          <Box
            key="icon"
            component="img"
            src={row.icon}
            alt={row.name}
            sx={{ width: 24, height: 24, objectFit: "contain" }}
          />,
          <Typography key="name" variant="body2" fontWeight={600}>
            {row.name}
          </Typography>,
          <Box
            key="link"
            component="a"
            href={row.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{
              color: theme.palette.primary.main,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontSize: "0.85rem",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Docs <ExternalLink size={12} />
          </Box>,
          row.createdAtFormatted,
          row.updatedAtFormatted,
        ]}
      />

      <AppDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        dialogTitle="Filter Technologies"
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
            <AppFlexLayout justify="space-between" align="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Used in Projects
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Show only stacks with projects
                </Typography>
              </Box>
              <AppSwitch
                checked={tempHasProjectOnly}
                onChange={(e) => setTempHasProjectOnly(e.target.checked)}
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
                  width: 64,
                  height: 64,
                  p: 1.5,
                  mb: 2,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  component="img"
                  src={selectedRow.icon}
                  alt={selectedRow.name}
                  sx={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </Paper>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                {selectedRow.name}
              </Typography>
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
                        Active stack
                      </Typography>
                    </Box>
                  </AppFlexLayout>
                </Paper>
                <Paper
                  component="a"
                  href={selectedRow.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    "&:hover": { borderColor: theme.palette.primary.main },
                  }}
                >
                  <Globe size={20} color={theme.palette.primary.main} />
                  <Box sx={{ overflow: "hidden" }}>
                    <Typography variant="caption" color="text.secondary">
                      Docs
                    </Typography>
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                    >
                      Visit
                    </Typography>
                  </Box>
                </Paper>
              </AppGridLayout>

              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                System Information
              </Typography>
              <Divider sx={{ my: 2, borderStyle: "dashed" }} />
              <AppFlexLayout direction="column" gap={0.5} align="stretch">
                <InfoRow
                  icon={Hash}
                  label="Tech ID"
                  value={selectedRow.id}
                  monospace
                />
                <InfoRow
                  icon={LinkIcon}
                  label="Original URL"
                  value={selectedRow.url}
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
                    label="Last Updated"
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
        dialogTitle={isEditMode ? "Edit Technology" : "Add Technology"}
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
                    label="Technology Name"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="icon"
                control={control}
                rules={{ required: "Required" }}
                render={({ field, fieldState: { error } }) => (
                  <AppInput
                    label="Icon URL (SVG/PNG)"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="url"
                control={control}
                rules={{ required: "Required" }}
                render={({ field, fieldState: { error } }) => (
                  <AppInput
                    label="Documentation URL"
                    fullWidth
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
            variant: "filled",
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
          <Typography variant="h6">Delete Technology?</Typography>
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

export default React.memo(Techs);
