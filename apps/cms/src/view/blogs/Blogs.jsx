import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Typography, Chip, useTheme, useMediaQuery } from "@mui/material";
import { AppTable, AppSnackBar } from "@heykyy/components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DateUtils } from "@heykyy/utils-frontend";

import { getsBlogs, deleteBlogs } from "../../services/blogs-service";

import FilterDialog from "./components/FilterDialog";
import DeleteDialog from "./components/DeleteDialog";
import DetailDialog from "./components/DetailDialog";

/**
 * Main Blogs Component handling table display, fetching, and actions.
 * @returns {JSX.Element} The Blogs wrapper component
 */
const Blogs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");

  const [selectedBlog, setSelectedBlog] = useState(null);

  const [blogStatus, setBlogStatus] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [isFeatured, setIsFeatured] = useState(undefined);
  const [sortBy, setSortBy] = useState(null);
  const [tempFilter, setTempFilter] = useState({
    status: null,
    categoryId: null,
    isFeatured: false,
    sortBy: null,
  });

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    variant: "success",
  });

  const sortOptions = useMemo(
    () => [
      { label: "Latest", value: "latest" },
      { label: "Oldest", value: "oldest" },
      { label: "Popular", value: "popular" },
      { label: "Most Liked", value: "most_liked" },
    ],
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchVal(searchVal);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchVal]);

  const {
    data: blogsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "blogs",
      pageVal,
      limit,
      debouncedSearchVal,
      blogStatus,
      categoryId,
      isFeatured,
      sortBy,
    ],
    queryFn: () =>
      getsBlogs(
        pageVal,
        limit,
        debouncedSearchVal,
        blogStatus,
        categoryId,
        isFeatured,
        sortBy
      ),
    staleTime: 30 * 60 * 1000,
  });

  const blogs = useMemo(() => blogsData?.data || [], [blogsData]);
  const pagination = useMemo(() => blogsData?.metadata || {}, [blogsData]);

  const tableData = useMemo(() => {
    return blogs.map((item) => ({
      ...item,
      categoryName: item.category?.name || "-",
      isFeaturedText: item.isFeatured ? "Yes" : "No",
      viewCount: item.stats?.views || 0,
      likeCount: item.stats?.likes || 0,
      tags: Array.isArray(item.tags) ? item.tags : [],
      createdAtFormatted: item.createdAt
        ? DateUtils.formatDateTime(item.createdAt)
        : "-",
      updatedAtFormatted: item.updatedAt
        ? DateUtils.formatDateTime(item.updatedAt)
        : "-",
    }));
  }, [blogs]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteBlogs(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["blogs"]);
      setSnackbar({
        open: true,
        message: "Blog deleted successfully",
        variant: "success",
      });
      setSelectedBlog(null);
      setOpenDeleteDialog(false);
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  /**
   * Applies the selected filters from the dialog and resets pagination to page 1.
   */
  const handleApplyFilter = useCallback(() => {
    setBlogStatus(tempFilter.status);
    setCategoryId(tempFilter.categoryId);
    setIsFeatured(tempFilter.isFeatured ? true : undefined);
    setSortBy(tempFilter.sortBy);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempFilter]);

  /**
   * Resets all filter values to their defaults and updates the table.
   */
  const handleResetFilter = useCallback(() => {
    setTempFilter({
      status: null,
      categoryId: null,
      isFeatured: false,
      sortBy: null,
    });
    setBlogStatus(null);
    setCategoryId(null);
    setIsFeatured(undefined);
    setSortBy(null);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  /**
   * Updates the current page value when pagination controls are clicked.
   * @param {Object} _ - The event object (unused)
   * @param {number} value - The selected page number
   */
  const onPageChange = useCallback((_, value) => setPageVal(value), []);

  /**
   * Updates the limit of rows per page and resets the current page to 1.
   * @param {Object} e - The event object containing the new limit value
   */
  const onRowsPerPageChange = useCallback((e) => {
    setLimit(e.target.value);
    setPageVal(1);
  }, []);

  /**
   * Handles changes in the search input field, resetting pagination and selection.
   * @param {Object} e - The event object containing the search string
   */
  const handleSearchChange = useCallback((e) => {
    setSearchVal(e.target.value);
    setPageVal(1);
    setSelectedBlog(null);
  }, []);

  return (
    <>
      <AppTable
        title="Blog Post Inventory"
        headers={[
          "ID",
          "Title",
          "Status",
          "Category",
          "Featured",
          "Views",
          "Likes",
          "Created At",
          "Updated At",
        ]}
        data={tableData}
        isLoading={isLoading}
        selectedId={selectedBlog?.id}
        searchVal={searchVal}
        onSearchChange={handleSearchChange}
        onRefresh={refetch}
        onCreate={() => navigate("/blogs/editor/create")}
        onUpdate={(row) => navigate(`/blogs/editor/${row.slug}/update`)}
        onDelete={(row) => {
          setSelectedBlog(row);
          setOpenDeleteDialog(true);
        }}
        onFilter={() => {
          setTempFilter({
            status: blogStatus,
            categoryId,
            isFeatured: !!isFeatured,
            sortBy,
          });
          setOpenFilterDialog(true);
        }}
        count={pagination.totalPages || 0}
        page={pageVal}
        onChange={onPageChange}
        rowsPerPage={limit}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowClick={(row) =>
          setSelectedBlog((prev) => (prev?.id === row.id ? null : row))
        }
        onRowDoubleClick={(row) => {
          setSelectedBlog(row);
          setOpenDetailDialog(true);
        }}
        renderRow={(row) => [
          <Typography
            key="id"
            variant="caption"
            sx={{ fontFamily: "monospace" }}
          >
            {row.id}
          </Typography>,
          <Typography key="title" variant="body2" fontWeight={600}>
            {row.title}
          </Typography>,
          <Chip
            key="status"
            label={row.status}
            size="small"
            variant="outlined"
            color={row.status === "PUBLISHED" ? "success" : "default"}
          />,
          row.categoryName,
          <Chip
            key="feat"
            label={row.isFeaturedText}
            size="small"
            color={row.isFeatured ? "primary" : "default"}
            variant="soft"
          />,
          row.viewCount,
          row.likeCount,
          row.createdAtFormatted,
          row.updatedAtFormatted,
        ]}
      />

      <FilterDialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        tempFilter={tempFilter}
        setTempFilter={setTempFilter}
        onApply={handleApplyFilter}
        onReset={handleResetFilter}
        sortOptions={sortOptions}
      />

      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        selectedBlog={selectedBlog}
        onConfirm={() => deleteMutation.mutate(selectedBlog.id)}
        isLoading={deleteMutation.isPending}
      />

      <DetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        selectedBlog={selectedBlog}
        isMobile={isMobile}
      />

      <AppSnackBar
        variant={snackbar.variant}
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
};

export default memo(Blogs);
