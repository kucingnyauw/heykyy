import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  useTheme,
  Typography,
  Paper,
  Chip,
  alpha,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  AppTable,
  AppInput,
  IconButton,
  AppFlexLayout,
  AppGridLayout,
  AppDialog,
  AppSnackBar,
  AppCheckBox,
  AppSwitch,
} from "@heykyy/components";
import {
  Hash,
  Calendar,
  Clock,
  GraduationCap,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Copy,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getsEducations,
  deleteEducation,
  updateEducation,
  createEducation,
} from "../../services/education-service";
import { DateUtils } from "@heykyy/utils-frontend";
import { useForm, Controller } from "react-hook-form";

/**
 * Main component for managing the Academic History (Educations) Inventory.
 * Features a data table with comprehensive CRUD operations and filtering capabilities.
 *
 * @returns {JSX.Element} The education management dashboard.
 */
const Educations = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [isCurrent, setIsCurrent] = useState(undefined);
  const [tempIsCurrent, setTempIsCurrent] = useState(false);

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

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: "",
      institution: "",
      description: "",
      startYear: "",
      endYear: "",
      isCurrent: false,
    },
  });

  const isCurrentChecked = watch("isCurrent");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchVal(searchVal), 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: educationData,
    isLoading: isTableLoading,
    refetch,
  } = useQuery({
    queryKey: ["educations", pageVal, limit, debouncedSearchVal, isCurrent],
    queryFn: () => getsEducations(pageVal, limit, debouncedSearchVal, isCurrent),
    staleTime: 30 * 60 * 1000,
  });

  const rawEducations = useMemo(() => educationData?.data ?? [], [educationData]);
  const metadata = useMemo(() => educationData?.metadata ?? {}, [educationData]);

  const tableData = useMemo(() => {
    return rawEducations.map((item) => ({
      ...item,
      startYearFormatted: item.startYear ? DateUtils.formatDate(item.startYear) : "-",
      endYearFormatted: item.isCurrent ? "Present" : item.endYear ? DateUtils.formatDate(item.endYear) : "-",
      createdAtFormatted: item.createdAt ? DateUtils.formatDateTime(item.createdAt) : "-",
      updatedAtFormatted: item.updatedAt ? DateUtils.formatDateTime(item.updatedAt) : "-",
    }));
  }, [rawEducations]);

  const createMutation = useMutation({
    mutationFn: createEducation,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["educations"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) => setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateEducation(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["educations"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) => setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: (message) => {
      queryClient.invalidateQueries(["educations"]);
      setSnackbar({ open: true, message, variant: "success" });
      setOpenDeleteDialog(false);
      setSelectedRow(null);
    },
    onError: (err) => setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const isGlobalLoading = useMemo(
    () => createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    [createMutation.isPending, updateMutation.isPending, deleteMutation.isPending]
  );

  /**
   * Updates the current page value when navigating through the table pagination.
   *
   * @param {Object} _ - The event object (unused).
   * @param {number} v - The new page number selected.
   */
  const onPageChange = useCallback((_, v) => setPageVal(v), []);

  /**
   * Adjusts the number of rows displayed per page and resets the current page to 1.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event containing the new limit.
   */
  const onRowsPerPageChange = useCallback((e) => {
    setLimit(e.target.value);
    setPageVal(1);
  }, []);

  /**
   * Toggles the selection of a table row. If the same row is clicked, it deselects it.
   *
   * @param {Object} row - The data object of the clicked row.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));
  }, []);

  /**
   * Handles the search input change, resets the pagination, and clears the current selection.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handleSearchChange = useCallback((e) => {
    setSearchVal(e.target.value);
    setPageVal(1);
    setSelectedRow(null);
  }, []);

  /**
   * Applies the temporary filter states to the main query and resets the pagination.
   */
  const handleApplyFilter = useCallback(() => {
    setIsCurrent(tempIsCurrent ? true : undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempIsCurrent]);

  /**
   * Resets all filter states to their default (unfiltered) values.
   */
  const handleResetFilter = useCallback(() => {
    setTempIsCurrent(false);
    setIsCurrent(undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  /**
   * Opens the form dialog for creating a new education record. Resets all form fields.
   */
  const handleOpenCreate = useCallback(() => {
    setIsEditMode(false);
    reset({ title: "", institution: "", description: "", startYear: "", endYear: "", isCurrent: false });
    setOpenFormDialog(true);
  }, [reset]);

  /**
   * Opens the form dialog in edit mode, pre-filling it with the provided or currently selected row's data.
   *
   * @param {Object} [row] - The specific row data to edit. Defaults to `selectedRow` if not provided.
   */
  const handleOpenEdit = useCallback((row) => {
    const target = row || selectedRow;
    if (!target) return;
    setIsEditMode(true);
    setSelectedRow(target);
    reset({
      title: target.title,
      institution: target.institution,
      description: target.description ?? "",
      startYear: target.startYear ? new Date(target.startYear).toISOString().split("T")[0] : "",
      endYear: target.endYear ? new Date(target.endYear).toISOString().split("T")[0] : "",
      isCurrent: target.isCurrent,
    });
    setOpenFormDialog(true);
  }, [selectedRow, reset]);

  /**
   * Closes the form dialog and resets the form validation state.
   */
  const handleCloseForm = useCallback(() => {
    setOpenFormDialog(false);
    reset();
  }, [reset]);

  /**
   * Submits the form data either as a new creation or an update to an existing record.
   * Automatically strips the `endYear` if the education is marked as currently ongoing.
   *
   * @param {Object} formData - The validated form data.
   */
  const onSubmitForm = useCallback((formData) => {
    const payload = { ...formData, endYear: formData.isCurrent ? null : formData.endYear };
    if (isEditMode && selectedRow?.id) {
      updateMutation.mutate({ id: selectedRow.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }, [isEditMode, selectedRow?.id, updateMutation, createMutation]);

  /**
   * Executes the deletion mutation for the currently selected education record.
   */
  const onDeleteConfirm = useCallback(() => {
    if (selectedRow?.id) deleteMutation.mutate(selectedRow.id);
  }, [selectedRow?.id, deleteMutation]);

  /**
   * Selects a row and triggers the deletion confirmation dialog.
   *
   * @param {Object} row - The data object of the row to be deleted.
   */
  const handleOpenDelete = useCallback((row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  }, []);

  /**
   * Local component for rendering a standard information row with an optional copy feature.
   *
   * @param {Object} props - The component props.
   * @param {React.ElementType} props.icon - The Lucide icon to display.
   * @param {string} props.label - The row's descriptive label.
   * @param {string|number} props.value - The text value to display.
   * @param {boolean} [props.monospace=false] - If true, formats the text in monospace.
   * @returns {JSX.Element}
   */
  const InfoRow = useCallback(({ icon: Icon, label, value, monospace = false }) => (
    <AppFlexLayout gap={2} sx={{ py: 1 }} align={monospace === true ? "center" : "flex-start"}>
      <Box sx={{ color: theme.palette.text.secondary }}><Icon size={18} /></Box>
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <Typography variant="caption" display="block" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight={monospace ? 600 : 500} sx={monospace ? { fontFamily: "monospace", fontSize: "0.85rem" } : {}} noWrap>{value ?? "-"}</Typography>
      </Box>
      {monospace && value && (
        <IconButton size="medium" onClick={() => navigator.clipboard.writeText(value)} icon={<Copy size={14} />} sx={{ width: 28, height: 28, p: 0.5 }} />
      )}
    </AppFlexLayout>
  ), [theme]);

  /**
   * Local component for rendering a high-visibility detail card within the detail dialog.
   *
   * @param {Object} props - The component props.
   * @param {React.ElementType} props.icon - The Lucide icon to display.
   * @param {string} props.label - The card's title label.
   * @param {string|number} props.value - The main value highlighted in the card.
   * @param {string} [props.color="primary"] - The MUI theme palette color key.
   * @returns {JSX.Element}
   */
  const DetailCard = useCallback(({ icon: Icon, label, value, color = "primary" }) => (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius, bgcolor: alpha(theme.palette.background.default, 0.4), display: "flex", alignItems: "center", gap: 2, height: "100%" }}>
      <Box sx={{ p: 1, borderRadius: theme.shape.borderRadius, bgcolor: alpha(theme.palette[color].main, 0.1), color: theme.palette[color].main, display: "flex" }}><Icon size={20} /></Box>
      <Box sx={{ overflow: "hidden" }}>
        <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", fontWeight: 700 }}>{label}</Typography>
        <Typography variant="body2" fontWeight="bold" noWrap>{value ?? "-"}</Typography>
      </Box>
    </Paper>
  ), [theme]);

  return (
    <>
      <AppTable
        title="Academic History Records"
        headers={["ID", "Title", "Institution", "Period", "Status", "Created At", "Updated At"]}
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
          setTempIsCurrent(!!isCurrent);
          setOpenFilterDialog(true);
        }}
        count={metadata?.totalPages || 0}
        page={pageVal}
        onChange={onPageChange}
        rowsPerPage={limit}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowClick={handleRowClick}
        onRowDoubleClick={(row) => { setSelectedRow(row); setOpenDetailDialog(true); }}
        renderRow={(row) => [
          <Typography key="id" variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>{row.id}</Typography>,
          <Typography key="t" variant="body2" fontWeight={600}>{row.title}</Typography>,
          row.institution,
          `${row.startYearFormatted} - ${row.endYearFormatted}`,
          <Chip key="s" label={row.isCurrent ? "Ongoing" : "Completed"} size="small" color={row.isCurrent ? "success" : "default"} sx={{ fontWeight: 700, height: 24, fontSize: "0.7rem" }} />,
          row.createdAtFormatted,
          row.updatedAtFormatted,
        ]}
      />

      <AppDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        dialogTitle="Filter Educations"
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
                <Typography variant="body2" fontWeight={600}>Currently Enrolled</Typography>
                <Typography variant="caption" color="text.secondary">Show only ongoing studies</Typography>
              </Box>
              <AppSwitch checked={tempIsCurrent} onChange={(e) => setTempIsCurrent(e.target.checked)} />
            </AppFlexLayout>
          </Box>
        </AppFlexLayout>
      </AppDialog>

      <AppDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="sm"
        actions={[{ label: "Close", variant: "outlined", onClick: () => setOpenDetailDialog(false) }]}
      >
        {selectedRow && (
          <Box>
            <AppFlexLayout direction="column" align="center" sx={{ background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${theme.palette.background.paper} 100%)`, pt: 4, pb: 3, px: 3, textAlign: "center" }}>
              <Paper elevation={2} sx={{ width: 56, height: 56, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, color: theme.palette.primary.main }}><GraduationCap size={28} /></Paper>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>{selectedRow.title}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedRow.institution}</Typography>
            </AppFlexLayout>
            <Box sx={{ px: 3, pb: 2 }}>
              <AppGridLayout columns="repeat(2, 1fr)" gap={2} sx={{ mb: 3 }}>
                <DetailCard icon={Building2} label="Institution" value={selectedRow.institution} />
                <DetailCard icon={CheckCircle2} label="Status" value={selectedRow.isCurrent ? "Enrolled" : "Completed"} color={selectedRow.isCurrent ? "success" : "primary"} />
              </AppGridLayout>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Description</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>{selectedRow.description || "No description provided."}</Typography>
              </Paper>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Timeline</Typography>
              <AppGridLayout columns="repeat(2, 1fr)" gap={2} sx={{ mb: 3 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                  <Typography variant="caption" color="text.secondary" display="block">Started</Typography>
                  <Typography variant="subtitle2" fontWeight="bold">{DateUtils.formatDate(selectedRow.startYear)}</Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: alpha(theme.palette.background.default, 0.4), borderColor: selectedRow.isCurrent ? theme.palette.success.main : theme.palette.divider }}>
                  <Typography variant="caption" color="text.secondary" display="block">Ended</Typography>
                  <Typography variant="subtitle2" fontWeight="bold" color={selectedRow.isCurrent ? "success.main" : "text.primary"}>{selectedRow.isCurrent ? "Present" : DateUtils.formatDate(selectedRow.endYear)}</Typography>
                </Paper>
              </AppGridLayout>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>System Information</Typography>
              <Divider sx={{ my: 2, borderStyle: "dashed" }} />
              <AppFlexLayout direction="column" gap={0.5} align="stretch">
                <InfoRow icon={Hash} label="Education ID" value={selectedRow.id} monospace />
                <AppGridLayout columns={isMobile ? "1fr" : "repeat(2, 1fr)"} sx={{ mt: 1 }}>
                  <InfoRow icon={Calendar} label="Created At" value={selectedRow.createdAtFormatted} />
                  <InfoRow icon={Clock} label="Updated At" value={selectedRow.updatedAtFormatted} />
                </AppGridLayout>
              </AppFlexLayout>
            </Box>
          </Box>
        )}
      </AppDialog>

      <AppDialog
        open={openFormDialog}
        onClose={handleCloseForm}
        dialogTitle={isEditMode ? "Update Education" : "New Education"}
        maxWidth="sm"
        actions={[
          { label: "Cancel", variant: "outlined", onClick: handleCloseForm },
          { label: isEditMode ? "Save Changes" : "Create", variant: "contained", onClick: handleSubmit(onSubmitForm), loading: isGlobalLoading },
        ]}
      >
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <Box sx={{ p: 2 }}>
            <AppFlexLayout direction="column" gap={3} align="stretch">
              <AppGridLayout columns="1fr" gap={2}>
                <Controller name="title" control={control} rules={{ required: "Required" }} render={({ field, fieldState: { error } }) => (
                  <AppInput label="Degree / Title" fullWidth error={!!error} helperText={error?.message} {...field} />
                )} />
                <Controller name="institution" control={control} rules={{ required: "Required" }} render={({ field, fieldState: { error } }) => (
                  <AppInput label="Institution" fullWidth error={!!error} helperText={error?.message} {...field} />
                )} />
                <Controller name="description" control={control} render={({ field }) => (
                  <AppInput label="Description" fullWidth multiline minRows={4} {...field} />
                )} />
              </AppGridLayout>
              <Box>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: isCurrentChecked ? theme.palette.primary.main : theme.palette.divider, bgcolor: isCurrentChecked ? alpha(theme.palette.primary.main, 0.04) : "transparent", transition: "0.2s" }}>
                  <Box><Typography variant="body2" fontWeight="bold">Current institution</Typography><Typography variant="caption" color="text.secondary">I am currently studying here</Typography></Box>
                  <Controller name="isCurrent" control={control} render={({ field }) => (
                    <AppCheckBox checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                  )} />
                </Paper>
                <AppGridLayout columns="repeat(2, 1fr)" gap={2}>
                  <Controller name="startYear" control={control} rules={{ required: "Required" }} render={({ field, fieldState: { error } }) => (
                    <AppInput type="date" label="Start Date" fullWidth InputLabelProps={{ shrink: true }} error={!!error} helperText={error?.message} {...field} />
                  )} />
                  {!isCurrentChecked && (
                    <Controller name="endYear" control={control} rules={{ required: !isCurrentChecked }} render={({ field, fieldState: { error } }) => (
                      <AppInput type="date" label="End Date" fullWidth InputLabelProps={{ shrink: true }} error={!!error} helperText={error?.message} {...field} />
                    )} />
                  )}
                </AppGridLayout>
              </Box>
            </AppFlexLayout>
          </Box>
        </form>
      </AppDialog>

      <AppDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        actions={[
          { label: "Cancel", variant: "outlined", onClick: () => setOpenDeleteDialog(false) },
          { label: "Delete", variant: "filled", color: "error", onClick: onDeleteConfirm, loading: isGlobalLoading },
        ]}
      >
        <Box sx={{ py: 3, textAlign: "center" }}>
          <AlertTriangle size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
          <Typography variant="h6">Delete Education?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Delete <b>{selectedRow?.title}</b>?</Typography>
        </Box>
      </AppDialog>

      <AppSnackBar open={snackbar.open} message={snackbar.message} variant={snackbar.variant} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))} />
    </>
  );
};

export default React.memo(Educations);