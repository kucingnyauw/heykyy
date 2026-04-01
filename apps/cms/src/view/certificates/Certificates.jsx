import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
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
} from "@heykyy/components";
import {
  FileText,
  Award,
  Hash,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  Image as ImageIcon,
  AlertTriangle,
  Download,
  Copy,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import {
  getsCertificates,
  createCertificates,
  updateCertificates,
  deleteCertificates,
} from "../../services/certificate-service";
import { DateUtils } from "@heykyy/utils-frontend";

/**
 * Main component for managing Professional Credentials & Certificates.
 * Handles the display, creation, updating, deletion, and filtering of certificate records.
 *
 * @returns {JSX.Element} The certificates management dashboard.
 */
const Certificates = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [certificateYear, setCertificateYear] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  const [tempFilter, setTempFilter] = useState({
    year: null,
    sortBy: null,
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

  const { control, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      title: "",
      issuer: "",
      year: new Date().getFullYear(),
      summary: "",
      files: [null, null],
    },
  });

  const sortOptions = useMemo(() => [
    { label: "Year (Newest)", value: "year_desc" },
    { label: "Year (Oldest)", value: "year_asc" },
    { label: "Latest Added", value: "latest_added" },
  ], []);

  const watchedFiles = watch("files");

  const imagePreview = useMemo(() => {
    if (watchedFiles?.[0] instanceof File) {
      return URL.createObjectURL(watchedFiles[0]);
    }
    return isEditMode ? selectedRow?.imageUrl : null;
  }, [watchedFiles, isEditMode, selectedRow?.imageUrl]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchVal(searchVal), 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: certData,
    isLoading: isTableLoading,
    refetch,
  } = useQuery({
    queryKey: ["certificates", pageVal, limit, debouncedSearchVal, certificateYear, sortBy],
    queryFn: () => getsCertificates(pageVal, limit, debouncedSearchVal, certificateYear, sortBy),
    staleTime: 30 * 60 * 1000,
  });

  const certificates = useMemo(() => certData?.data ?? [], [certData]);
  const metadata = useMemo(() => certData?.metadata ?? {}, [certData]);

  const tableData = useMemo(() => {
    return certificates.map((item) => ({
      ...item,
      fileUrl: item.file?.url ?? null,
      imageUrl: item.image?.url ?? null,
      createdAtFormatted: item.createdAt ? DateUtils.formatDateTime(item.createdAt) : "-",
      updatedAtFormatted: item.updatedAt ? DateUtils.formatDateTime(item.updatedAt) : "-",
    }));
  }, [certificates]);

  const createMutation = useMutation({
    mutationFn: createCertificates,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["certificates"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) => setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCertificates(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["certificates"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) => setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCertificates,
    onSuccess: (message) => {
      queryClient.invalidateQueries(["certificates"]);
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
   * Readies the form dialog for creating a new certificate by clearing existing data.
   */
  const handleOpenCreate = useCallback(() => {
    setIsEditMode(false);
    reset({ title: "", issuer: "", year: new Date().getFullYear(), summary: "", files: [null, null] });
    setOpenFormDialog(true);
  }, [reset]);

  /**
   * Populates and opens the form dialog to edit the data of an existing certificate.
   *
   * @param {Object} [row] - The specific row data to edit. Defaults to the currently selected row if omitted.
   */
  const handleOpenEdit = useCallback((row) => {
    const target = row || selectedRow;
    if (!target) return;
    setIsEditMode(true);
    setSelectedRow(target);
    reset({ title: target.title, issuer: target.issuer, year: target.year, summary: target.summary, files: [null, null] });
    setOpenFormDialog(true);
  }, [selectedRow, reset]);

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
    setCertificateYear(tempFilter.year);
    setSortBy(tempFilter.sortBy);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempFilter]);

  /**
   * Resets all filter and sorting states back to their default values and closes the dialog.
   */
  const handleResetFilter = useCallback(() => {
    setTempFilter({ year: null, sortBy: null });
    setCertificateYear(null);
    setSortBy(null);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  /**
   * Handles the selection of a file from an input element, updating the specific file index in the form state.
   *
   * @param {number} index - The index of the file array to update (0 for image, 1 for PDF).
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event containing the selected file.
   */
  const handleFileChange = useCallback((index, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const currentFiles = [...watchedFiles];
      currentFiles[index] = file;
      setValue("files", currentFiles);
    }
  }, [watchedFiles, setValue]);

  /**
   * Submits the processed form data to either create a new certificate or update the selected one.
   *
   * @param {Object} formData - The validated and complete form data object.
   */
  const onSubmitForm = useCallback((formData) => {
    if (isEditMode && selectedRow?.id) {
      updateMutation.mutate({ id: selectedRow.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [isEditMode, selectedRow?.id, updateMutation, createMutation]);

  /**
   * Executes the deletion mutation API call for the targeted certificate record.
   */
  const onDeleteConfirm = useCallback(() => {
    if (selectedRow?.id) deleteMutation.mutate(selectedRow.id);
  }, [selectedRow?.id, deleteMutation]);

  /**
   * Opens the specified URL in a new browser tab for downloading or viewing a document.
   *
   * @param {string} url - The URL string of the document to be opened.
   */
  const handleDownload = useCallback((url) => {
    if (url) window.open(url, "_blank");
  }, []);

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

  return (
    <>
      <AppTable
        title="Professional Credentials & Certificates"
        headers={["ID", "Certificate Name", "Issuer", "Year", "Created At", "Updated At", "Document"]}
        data={tableData}
        isLoading={isTableLoading}
        selectedId={selectedRow?.id}
        searchVal={searchVal}
        onSearchChange={handleSearchChange}
        onRefresh={refetch}
        onCreate={handleOpenCreate}
        onUpdate={handleOpenEdit}
        onDelete={(row) => { setSelectedRow(row); setOpenDeleteDialog(true); }}
        onFilter={() => {
          setTempFilter({ year: certificateYear, sortBy: sortBy });
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
          <Typography key="id" variant="caption" sx={{ fontFamily: "monospace" }}>{row.id}</Typography>,
          <Typography key="title" variant="body2" fontWeight={600}>{row.title}</Typography>,
          row.issuer,
          <Chip key="year" label={row.year} size="small" variant="outlined" sx={{ height: 24 }} />,
          row.createdAtFormatted,
          row.updatedAtFormatted,
          row.fileUrl ? (
            <IconButton
            size="medium"
              key="dl"
              sx={{ width: 30, height: 30, bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}
              icon={<Download size={14} />}
              onClick={(e) => { e.stopPropagation(); handleDownload(row.fileUrl); }}
            />
          ) : "-"
        ]}
      />

      <AppDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        dialogTitle="Filter Certificates"
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
                value={sortOptions.find(o => o.value === tempFilter.sortBy) || null}
                onChange={(e) => setTempFilter(prev => ({ ...prev, sortBy: e.target.value?.value || null }))}
              />
              <AppInput
                label="Filter by Year"
                type="number"
                placeholder="Ex: 2024"
                value={tempFilter.year ?? ""}
                onChange={(e) => setTempFilter(prev => ({ ...prev, year: e.target.value }))}
              />
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
              <Paper elevation={2} sx={{ width: 56, height: 56, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", mb: 2, color: theme.palette.primary.main }}>
                <Award size={28} />
              </Paper>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>{selectedRow.title}</Typography>
              <Chip label={selectedRow.year} size="small" variant="outlined" />
            </AppFlexLayout>
            <Box sx={{ px: 3, pb: 2 }}>
              <AppGridLayout columns="repeat(2, 1fr)" gap={2} sx={{ mb: 3 }}>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                  <AppFlexLayout align="center" gap={2}>
                    <CheckCircle2 size={20} color={theme.palette.success.main} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Status</Typography>
                      <Typography variant="subtitle2" fontWeight="bold">Valid</Typography>
                    </Box>
                  </AppFlexLayout>
                </Paper>
                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.4) }}>
                  <AppFlexLayout align="center" gap={2}>
                    <Briefcase size={20} color={theme.palette.primary.main} />
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography variant="caption" color="text.secondary">Issuer</Typography>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>{selectedRow.issuer}</Typography>
                    </Box>
                  </AppFlexLayout>
                </Paper>
              </AppGridLayout>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>Summary</Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Typography variant="body2" color="text.secondary">{selectedRow.summary ?? "No description provided."}</Typography>
              </Paper>
              {selectedRow.imageUrl && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>Preview</Typography>
                  <Box component="img" src={selectedRow.imageUrl} sx={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} />
                </Box>
              )}
              <Paper variant="outlined" sx={{ p: 2, mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: alpha(theme.palette.primary.main, 0.3), bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <AppFlexLayout gap={2}>
                  <Box sx={{ p: 1, borderRadius: "50%", bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}><FileText size={18} /></Box>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">Document PDF</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedRow.fileUrl ? "Ready to download" : "No file available"}</Typography>
                  </Box>
                </AppFlexLayout>
                {selectedRow.fileUrl && <IconButton size="medium" icon={<Download size={20} />} onClick={() => handleDownload(selectedRow.fileUrl)} />}
              </Paper>
              <Divider sx={{ my: 2, borderStyle: "dashed" }} />
              <AppFlexLayout direction="column" gap={0.5} align="stretch">
                <InfoRow icon={Hash} label="Certificate ID" value={selectedRow.id} monospace />
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
        dialogTitle={isEditMode ? "Edit Certificate" : "Add Certificate"}
        maxWidth="sm"
        actions={[
          { label: "Cancel", variant: "outlined", onClick: handleCloseForm },
          { label: isEditMode ? "Save Changes" : "Create", variant: "filled", onClick: handleSubmit(onSubmitForm), loading: isGlobalLoading },
        ]}
      >
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <Box sx={{ p: 2 }}>
            <AppFlexLayout direction="column" gap={2.5} align="stretch">
              {imagePreview && (
                <Box sx={{ textAlign: "center", mb: 1 }}>
                  <Box component="img" src={imagePreview} sx={{ width: "100%", maxHeight: 180, objectFit: "contain", borderRadius: 2, border: `1px solid ${theme.palette.divider}` }} />
                </Box>
              )}
              <AppGridLayout columns="repeat(2, 1fr)" gap={2}>
                <Controller name="title" control={control} rules={{ required: "Required" }} render={({ field, fieldState: { error } }) => (
                  <AppInput label="Certificate Name" fullWidth error={!!error} {...field} />
                )} />
                <Controller name="issuer" control={control} rules={{ required: "Required" }} render={({ field, fieldState: { error } }) => (
                  <AppInput label="Issuer" fullWidth error={!!error} {...field} />
                )} />
              </AppGridLayout>
              <Controller name="year" control={control} rules={{ required: "Required" }} render={({ field }) => (
                <AppInput label="Year" type="number" fullWidth {...field} />
              )} />
              <Controller name="summary" control={control} render={({ field }) => (
                <AppInput label="Summary" multiline rows={3} fullWidth {...field} />
              )} />
              <AppGridLayout columns="repeat(2, 1fr)" gap={2}>
                <Box component="label" sx={{ border: "1px dashed", borderRadius: 2, p: 2, textAlign: "center", cursor: "pointer", borderColor: watchedFiles?.[0] ? theme.palette.primary.main : "divider" }}>
                  <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(0, e)} />
                  <ImageIcon size={24} color={watchedFiles?.[0] ? theme.palette.primary.main : theme.palette.text.secondary} />
                  <Typography variant="caption" display="block">Image</Typography>
                  <Typography variant="caption" color="primary" noWrap display="block">{watchedFiles?.[0]?.name ?? (isEditMode && selectedRow?.imageUrl ? "Current Image" : "Select")}</Typography>
                </Box>
                <Box component="label" sx={{ border: "1px dashed", borderRadius: 2, p: 2, textAlign: "center", cursor: "pointer", borderColor: watchedFiles?.[1] ? theme.palette.error.main : "divider" }}>
                  <input type="file" hidden accept=".pdf" onChange={(e) => handleFileChange(1, e)} />
                  <FileText size={24} color={watchedFiles?.[1] ? theme.palette.error.main : theme.palette.text.secondary} />
                  <Typography variant="caption" display="block">PDF File</Typography>
                  <Typography variant="caption" color="error" noWrap display="block">{watchedFiles?.[1]?.name ?? (isEditMode && selectedRow?.fileUrl ? "Current PDF" : "Select")}</Typography>
                </Box>
              </AppGridLayout>
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
          { label: "Delete", variant: "contained", color: "error", onClick: onDeleteConfirm, loading: isGlobalLoading },
        ]}
      >
        <Box sx={{ py: 3, textAlign: "center" }}>
          <AlertTriangle size={48} color={theme.palette.error.main} style={{ marginBottom: 16 }} />
          <Typography variant="h6">Delete Certificate?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Delete <b>{selectedRow?.title}</b>?</Typography>
        </Box>
      </AppDialog>

      <AppSnackBar open={snackbar.open} message={snackbar.message} variant={snackbar.variant} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} />
    </>
  );
};

export default memo(Certificates);