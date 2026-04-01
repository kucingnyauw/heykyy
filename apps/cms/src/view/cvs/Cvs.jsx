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
  AppSwitch,
  AppSnackBar,
} from "@heykyy/components";
import {
  Hash,
  Calendar,
  Clock,
  FileText,
  Download,
  Sparkle,
  AlertTriangle,
  UploadCloud,
  CheckCircle2,
  X,
  Copy,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getsCvs,
  updateCvs,
  deleteCvs,
  createCvs,
} from "../../services/cvs-service";
import { DateUtils } from "@heykyy/utils-frontend";
import { useForm, Controller } from "react-hook-form";

const Cvs = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [isMain, setIsMain] = useState(undefined);
  const [tempIsMain, setTempIsMain] = useState(false);

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
      title: "",
      isMain: false,
      file: null,
    },
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchVal(searchVal), 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: cvData,
    isLoading: isTableLoading,
    refetch,
  } = useQuery({
    queryKey: ["cvs", pageVal, limit, debouncedSearchVal, isMain],
    queryFn: () => getsCvs(pageVal, limit, debouncedSearchVal, isMain),
    staleTime: 30 * 60 * 1000,
  });

  const rawCvs = useMemo(() => cvData?.data ?? [], [cvData]);
  const metadata = useMemo(() => cvData?.metadata ?? {}, [cvData]);

  const tableData = useMemo(() => {
    return rawCvs.map((item) => ({
      ...item,
      fileUrl: item.file?.url ?? "",
      createdAtFormatted: item.createdAt
        ? DateUtils.formatDateTime(item.createdAt)
        : "-",
      updatedAtFormatted: item.updatedAt
        ? DateUtils.formatDateTime(item.updatedAt)
        : "-",
    }));
  }, [rawCvs]);

  const createMutation = useMutation({
    mutationFn: createCvs,
    onSuccess: (res) => {
      queryClient.invalidateQueries(["cvs"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCvs(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["cvs"]);
      setSnackbar({ open: true, message: res?.message, variant: "success" });
      handleCloseForm();
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCvs,
    onSuccess: (message) => {
      queryClient.invalidateQueries(["cvs"]);
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

  const onPageChange = useCallback((_, value) => setPageVal(value), []);
  const onRowsPerPageChange = useCallback((e) => {
    setLimit(e.target.value);
    setPageVal(1);
  }, []);

  const handleRowClick = useCallback((row) => {
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));
  }, []);

  const handleRowDoubleClick = useCallback((row) => {
    setSelectedRow(row);
    setOpenDetailDialog(true);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchVal(e.target.value);
    setPageVal(1);
    setSelectedRow(null);
  }, []);

  const handleApplyFilter = useCallback(() => {
    setIsMain(tempIsMain ? true : undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempIsMain]);

  const handleResetFilter = useCallback(() => {
    setTempIsMain(false);
    setIsMain(undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  const handleOpenCreate = useCallback(() => {
    setIsEditMode(false);
    reset({ title: "", isMain: false, file: null });
    setOpenFormDialog(true);
  }, [reset]);

  const handleOpenEdit = useCallback(
    (row) => {
      const target = row || selectedRow;
      if (!target) return;
      setIsEditMode(true);
      setSelectedRow(target);
      reset({ title: target.title, isMain: target.isMain, file: null });
      setOpenFormDialog(true);
    },
    [selectedRow, reset]
  );

  const handleCloseForm = useCallback(() => {
    setOpenFormDialog(false);
    reset();
  }, [reset]);

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

  const onDeleteConfirm = useCallback(() => {
    if (selectedRow?.id) deleteMutation.mutate(selectedRow.id);
  }, [selectedRow?.id, deleteMutation]);

  const handleOpenDelete = useCallback((row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  }, []);

  const closeSnackbar = useCallback(
    () => setSnackbar((prev) => ({ ...prev, open: false })),
    []
  );

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
        title="CV Versions & Documents"
        headers={[
          "ID",
          "Title",
          "Status",
          "Download",
          "Created At",
          "Updated At",
        ]}
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
          setTempIsMain(!!isMain);
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
          <Typography key="title" variant="body2" fontWeight={600}>
            {row.title}
          </Typography>,
          row.isMain ? (
            <Chip
              key="status-main"
              icon={<Sparkle size={14} fill="currentColor" />}
              label="Main CV"
              size="small"
              color="primary"
              sx={{ fontWeight: 600, fontSize: "0.7rem", height: 24 }}
            />
          ) : (
            <Chip
              key="status-alt"
              label="Alternative"
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem", height: 24 }}
            />
          ),
          row.fileUrl ? (
            <IconButton
            size="medium"
              key="dl"
              sx={{
                width: 30,
                height: 30,
                bgcolor: alpha(theme.palette.success.main, 0.1),
                color: theme.palette.success.main,
              }}
              icon={<Download size={14} />}
              onClick={(e) => {
                e.stopPropagation();
                window.open(row.fileUrl, "_blank");
              }}
            />
          ) : (
            "-"
          ),
          row.createdAtFormatted,
          row.updatedAtFormatted,
        ]}
      />

      <AppDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        dialogTitle="Filter CVs"
        maxWidth="xs"
        fullWidth
        actions={[
          { label: "Reset", variant: "outlined", onClick: handleResetFilter },
          { label: "Apply", variant: "filled", onClick: handleApplyFilter },
        ]}
        contentSx={{ p: 0 }}
      >
        <AppFlexLayout direction="column" gap={0} sx={{ width: "100%" }}>
          <Box
            sx={{
              p: 2.5,
              width: "100%",
            }}
          >
            <AppFlexLayout justify="space-between" align="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  Main CV Only
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Show only primary resume
                </Typography>
              </Box>
              <AppSwitch
                checked={tempIsMain}
                onChange={(e) => setTempIsMain(e.target.checked)}
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
                <FileText size={28} />
              </Paper>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                {selectedRow.title}
              </Typography>
              {selectedRow.isMain && (
                <Chip
                  icon={<Sparkle size={14} fill="currentColor" />}
                  label="Primary Resume"
                  size="small"
                  color="warning"
                  sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                />
              )}
            </AppFlexLayout>
            <Box sx={{ px: 3, pb: 2 }}>
              <Paper
                component="a"
                href={selectedRow.fileUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  transition: "0.2s",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                  },
                }}
              >
                <AppFlexLayout gap={2}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: theme.palette.success.main,
                    }}
                  >
                    <FileText size={18} />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color="text.primary"
                    >
                      Document File
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedRow.fileUrl
                        ? "Click to view PDF"
                        : "No file available"}
                    </Typography>
                  </Box>
                </AppFlexLayout>
                <Download size={20} color={theme.palette.text.secondary} />
              </Paper>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                System Information
              </Typography>
              <Divider sx={{ my: 2, borderStyle: "dashed" }} />
              <AppFlexLayout direction="column" gap={0.5} align="stretch">
                <InfoRow
                  icon={Hash}
                  label="CV ID"
                  value={selectedRow.id}
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
        dialogTitle={isEditMode ? "Edit CV Version" : "Upload New CV"}
        maxWidth="sm"
        actions={[
          { label: "Cancel", variant: "outlined", onClick: handleCloseForm },
          {
            label: isEditMode ? "Save Changes" : "Upload",
            variant: "contained",
            onClick: handleSubmit(onSubmitForm),
            loading: isGlobalLoading,
          },
        ]}
      >
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <Box sx={{ p: 2 }}>
            <AppFlexLayout direction="column" gap={3} align="stretch">
              <Controller
                name="title"
                control={control}
                rules={{ required: "Required" }}
                render={({ field, fieldState: { error } }) => (
                  <AppInput
                    label="CV Title / Version"
                    placeholder="e.g. Software Engineer 2026"
                    fullWidth
                    error={!!error}
                    helperText={error?.message}
                    {...field}
                  />
                )}
              />
              <Controller
                name="isMain"
                control={control}
                render={({ field }) => (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderColor: field.value
                        ? theme.palette.primary.main
                        : theme.palette.divider,
                      bgcolor: field.value
                        ? alpha(theme.palette.primary.main, 0.04)
                        : "transparent",
                      transition: "0.2s",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Set as Main CV
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Primary resume for landing page
                      </Typography>
                    </Box>
                    <AppSwitch
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  </Paper>
                )}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1.5,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <FileText size={18} /> PDF Document
                </Typography>
                <Controller
                  name="file"
                  control={control}
                  rules={{
                    required: !isEditMode ? "Please upload a PDF file" : false,
                  }}
                  render={({
                    field: { onChange, value },
                    fieldState: { error },
                  }) => (
                    <Box>
                      {!value ? (
                        <Box
                          component="label"
                          sx={{
                            border: `2px dashed ${
                              error
                                ? theme.palette.error.main
                                : theme.palette.divider
                            }`,
                            borderRadius: theme.shape.borderRadius,
                            p: 4,
                            textAlign: "center",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 1.5,
                            bgcolor: alpha(
                              theme.palette.background.default,
                              0.5
                            ),
                            "&:hover": {
                              borderColor: theme.palette.primary.main,
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <input
                            type="file"
                            hidden
                            accept=".pdf"
                            onChange={(e) => onChange(e.target.files)}
                          />
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <UploadCloud size={28} />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="700">
                              Click to upload or drag and drop
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              PDF (Max. 10MB)
                            </Typography>
                          </Box>
                        </Box>
                      ) : (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderColor: theme.palette.success.main,
                            bgcolor: alpha(theme.palette.success.main, 0.02),
                          }}
                        >
                          <AppFlexLayout gap={2} sx={{ overflow: "hidden" }}>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                color: theme.palette.success.main,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <CheckCircle2 size={24} />
                            </Box>
                            <Box sx={{ overflow: "hidden" }}>
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                noWrap
                              >
                                {value[0]?.name ?? "File selected"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Ready to be uploaded
                              </Typography>
                            </Box>
                          </AppFlexLayout>
                          <IconButton
                          size="medium"
                            onClick={() => onChange(null)}
                            sx={{ color: theme.palette.error.main }}
                            icon={<X size={18} />}
                          />
                        </Paper>
                      )}
                      {error && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ mt: 1, display: "block", ml: 1 }}
                        >
                          {error.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />
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
          <Typography variant="h6">Delete CV?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Delete <b>{selectedRow?.title}</b>?
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

export default React.memo(Cvs);
