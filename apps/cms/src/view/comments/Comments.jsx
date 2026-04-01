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
  AppProfileAvatar,
  AppSwitch,
} from "@heykyy/components";
import {
  RotateCcw,
  Hash,
  Calendar,
  Clock,
  MessageSquare,
  User,
  ExternalLink,
  AlertTriangle,
  CornerDownRight,
  GitCommit,
  Copy,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getsCommentsMonitor,
  deleteComment,
} from "../../services/comment-service";
import { DateUtils } from "@heykyy/utils-frontend";

/**
 * Main component for the Administrative Comments Monitor.
 * Handles displaying, searching, filtering, and deleting user comments across different sources.
 *
 * @returns {JSX.Element} The Comments monitoring dashboard interface.
 */
const Comments = () => {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [isReplied, setIsReplied] = useState(undefined);
  const [tempIsReplied, setTempIsReplied] = useState(false);

  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchVal(searchVal), 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: queryResult,
    isLoading: isTableLoading,
    refetch,
  } = useQuery({
    queryKey: ["comments", pageVal, limit, debouncedSearchVal, isReplied],
    queryFn: () => getsCommentsMonitor(pageVal, limit, debouncedSearchVal, isReplied),
    staleTime: 30 * 60 * 1000,
  });

  const metadata = useMemo(() => queryResult?.metadata ?? {}, [queryResult]);

  const tableData = useMemo(() => {
    const rawData = queryResult?.data ?? [];
    return rawData.map((item) => ({
      ...item,
      authorName: item.author?.name ?? "Anonymous",
      authorAvatar: item.author?.avatar,
      comment: item.content,
      sourceTitle: item.source?.title ?? "Unknown Source",
      sourceType: item.source?.type ?? "N/A",
      createdAtFormatted: item.timestamps?.createdAt
        ? DateUtils.formatDateTime(item.timestamps.createdAt)
        : "-",
      updatedAtFormatted: item.timestamps?.updatedAt
        ? DateUtils.formatDateTime(item.timestamps.updatedAt)
        : "-",
    }));
  }, [queryResult]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteComment(id),
    onSuccess: (message) => {
      queryClient.invalidateQueries(["comments"]);
      setSnackbar({ open: true, message: message, variant: "success" });
      setOpenDeleteDialog(false);
      setOpenDetailDialog(false);
      setSelectedRow(null);
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  /**
   * Updates the current page value when the user interacts with pagination controls.
   *
   * @param {React.SyntheticEvent} _ - The original event (unused).
   * @param {number} value - The selected page number.
   */
  const onPageChange = useCallback((_, value) => setPageVal(value), []);

  /**
   * Updates the limit of rows to display per page and resets pagination to page 1.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event containing the new limit.
   */
  const onRowsPerPageChange = useCallback((e) => {
    setLimit(e.target.value);
    setPageVal(1);
  }, []);

  /**
   * Toggles the selection of a table row. If the same row is clicked, the selection is cleared.
   *
   * @param {Object} row - The data object corresponding to the clicked row.
   */
  const handleRowClick = useCallback((row) => {
    setSelectedRow((prev) => (prev?.id === row.id ? null : row));
  }, []);

  /**
   * Sets the clicked row as selected and opens the detail dialog overlay.
   *
   * @param {Object} row - The data object corresponding to the double-clicked row.
   */
  const handleRowDoubleClick = useCallback((row) => {
    setSelectedRow(row);
    setOpenDetailDialog(true);
  }, []);

  /**
   * Updates the search state based on input, resets pagination, and clears selected rows.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event containing the search string.
   */
  const handleSearchChange = useCallback((e) => {
    setSearchVal(e.target.value);
    setPageVal(1);
    setSelectedRow(null);
  }, []);

  /**
   * Applies the temporary filter states to the active query and closes the filter dialog.
   */
  const handleApplyFilter = useCallback(() => {
    setIsReplied(tempIsReplied ? true : undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempIsReplied]);

  /**
   * Resets all filter configurations to their default states and closes the filter dialog.
   */
  const handleResetFilter = useCallback(() => {
    setTempIsReplied(false);
    setIsReplied(undefined);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  /**
   * Sets the target row and opens the deletion confirmation dialog.
   *
   * @param {Object} row - The data object representing the row intended for deletion.
   */
  const handleOpenDelete = useCallback((row) => {
    setSelectedRow(row);
    setOpenDeleteDialog(true);
  }, []);

  /**
   * Triggers the API mutation to permanently delete the selected comment.
   */
  const onDeleteConfirm = useCallback(() => {
    if (selectedRow?.id) {
      deleteMutation.mutate(selectedRow.id);
    }
  }, [selectedRow?.id, deleteMutation]);

  /**
   * Dismisses the active snackbar notification.
   */
  const closeSnackbar = useCallback(
    () => setSnackbar((p) => ({ ...p, open: false })),
    []
  );

  /**
   * A local component for rendering informational rows, optionally providing a clipboard copy button or a styled chip.
   *
   * @param {Object} props - Component props.
   * @param {React.ElementType} props.icon - The Lucide icon to display next to the label.
   * @param {string} props.label - The descriptive label for the data point.
   * @param {string|number} props.value - The main text value to display.
   * @param {boolean} [props.monospace=false] - Applies monospace typography if true.
   * @param {string|null} [props.chipColor=null] - Renders the value as an MUI Chip with the specified theme color if provided.
   * @returns {JSX.Element}
   */
  const InfoRow = useCallback(
    ({ icon: Icon, label, value, monospace = false, chipColor = null }) => (
      <AppFlexLayout gap={2} sx={{ py: 1 }} align="center">
        <Box sx={{ color: theme.palette.text.secondary }}>
          <Icon size={18} />
        </Box>
        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <Typography variant="caption" display="block" color="text.secondary">
            {label}
          </Typography>
          {chipColor ? (
            <Chip
              label={value}
              color={chipColor}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, height: 24, mt: 0.5 }}
            />
          ) : (
            <Typography
              variant="body2"
              fontWeight={monospace ? 600 : 500}
              sx={
                monospace
                  ? { fontFamily: "monospace", fontSize: "0.85rem" }
                  : { wordBreak: "break-word" }
              }
              noWrap={!chipColor && monospace}
            >
              {value ?? "-"}
            </Typography>
          )}
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
        title="Interaction & Comment Records"
        headers={["ID", "User", "Comment", "Source", "Admin Reply", "Date"]}
        data={tableData}
        isLoading={isTableLoading}
        selectedId={selectedRow?.id}
        searchVal={searchVal}
        onSearchChange={handleSearchChange}
        onRefresh={refetch}
        onDelete={handleOpenDelete}
        onFilter={() => {
          setTempIsReplied(!!isReplied);
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
          <Typography key="id" variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
            {row.id}
          </Typography>,
          <AppFlexLayout key="user" gap={1.5} align="center">
            <AppProfileAvatar
              size="sm"
              profileUrl={row.authorAvatar}
              displayName={row.authorName}
            />
            <Typography variant="body2" fontWeight={500}>
              {row.authorName}
            </Typography>
          </AppFlexLayout>,
          <Typography
            key="comment"
            variant="body2"
            noWrap
            sx={{ maxWidth: 300 }}
          >
            {row.comment}
          </Typography>,
          <Chip
            key="source"
            label={row.sourceType}
            size="small"
            variant="outlined"
            color="primary"
            sx={{
              fontSize: "0.7rem",
              fontWeight: 600,
              height: 24,
              textTransform: "uppercase",
            }}
          />,
          <Chip
            key="reply"
            label={row.hasAdminReply ? "Replied" : "Pending"}
            size="small"
            variant="outlined"
            color={row.hasAdminReply ? "success" : "warning"}
            sx={{ fontSize: "0.7rem", height: 24 }}
          />,
          row.createdAtFormatted,
        ]}
      />

      <AppDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        dialogTitle="Filter Comments"
        maxWidth="xs"
        fullWidth
        actions={[
          { label: "Reset", variant: "outlined", onClick: handleResetFilter },
          { label: "Apply", variant: "filled", onClick: handleApplyFilter },
        ]}
        contentSx={{ p: 0 }}
      >
        <AppFlexLayout direction="column" gap={0} sx={{ width: "100%" }}>
          <Box sx={{ p: 2.5, width: "100%"}}>
            <AppFlexLayout justify="space-between" align="center">
              <Box>
                <Typography variant="body2" fontWeight={600}>Replied Only</Typography>
                <Typography variant="caption" color="text.secondary">Show comments with admin reply</Typography>
              </Box>
              <AppSwitch
                checked={tempIsReplied}
                onChange={(e) => setTempIsReplied(e.target.checked)}
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
                <MessageSquare size={28} />
              </Paper>
              <Typography variant="h6" fontWeight="800" sx={{ mb: 1 }}>
                Comment Details
              </Typography>
            </AppFlexLayout>

            <Box sx={{ px: 3, pb: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Content
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: alpha(theme.palette.background.default, 0.4),
                }}
              >
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  "{selectedRow.comment}"
                </Typography>
              </Paper>

              <AppGridLayout columns="repeat(2, 1fr)" gap={2} sx={{ mb: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: alpha(theme.palette.background.default, 0.4),
                  }}
                >
                  <AppFlexLayout align="center" gap={1.5}>
                    <User size={18} color={theme.palette.primary.main} />
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography variant="caption" color="text.secondary">
                        Author
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" noWrap>
                        {selectedRow.authorName}
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
                  <AppFlexLayout align="center" gap={1.5}>
                    <ExternalLink
                      size={18}
                      color={theme.palette.primary.main}
                    />
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography variant="caption" color="text.secondary">
                        Source
                      </Typography>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        noWrap
                        color="primary"
                      >
                        {selectedRow.sourceTitle}
                      </Typography>
                    </Box>
                  </AppFlexLayout>
                </Paper>
              </AppGridLayout>

              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                Metadata
              </Typography>
              <Divider sx={{ width: "100%", borderStyle: "dashed", my: 2 }} />
              <AppFlexLayout direction="column" gap={0.5} align="stretch">
                <InfoRow
                  icon={selectedRow.hasAdminReply ? CornerDownRight : GitCommit}
                  label="Reply Status"
                  value={
                    selectedRow.hasAdminReply
                      ? "Replied by Admin"
                      : "Awaiting Reply"
                  }
                  chipColor={selectedRow.hasAdminReply ? "success" : "warning"}
                />
                <InfoRow
                  icon={Hash}
                  label="Comment ID"
                  value={selectedRow.id}
                  monospace
                />
                <AppGridLayout
                  columns={isMobile ? "1fr" : "repeat(2, 1fr)"}
                  sx={{ mt: 1 }}
                >
                  <InfoRow
                    icon={Calendar}
                    label="Date Posted"
                    value={selectedRow.createdAtFormatted}
                  />
                  <InfoRow
                    icon={Clock}
                    label="Last Update"
                    value={selectedRow.updatedAtFormatted}
                  />
                </AppGridLayout>
              </AppFlexLayout>
            </Box>
          </Box>
        )}
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
            loading: deleteMutation.isPending,
          },
        ]}
      >
        <Box sx={{ py: 3, textAlign: "center" }}>
          <AlertTriangle
            size={48}
            color={theme.palette.error.main}
            style={{ marginBottom: 16 }}
          />
          <Typography variant="h6">Delete Comment?</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Delete comment by <b>{selectedRow?.authorName}</b>?
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

export default Comments;