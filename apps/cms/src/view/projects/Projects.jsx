import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Typography,
  Chip,
  Avatar,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import { AppTable, AppSnackBar } from "@heykyy/components";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DateUtils } from "@heykyy/utils-frontend";
import { getsProjects, deleteProjects } from "../../services/projects-service";

import StackListDialog from "../../ui-components/StackList";
import FilterDialog from "./components/FilterDialog";
import DeleteDialog from "./components/DeleteDialog";
import DetailDialog from "./components/DetailDialog";

/**
 * Main component handling the display, filtering, and management of the project portfolio inventory.
 *
 * @returns {JSX.Element} The Project portfolio dashboard.
 */
const Project = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [limit, setLimit] = useState(5);
  const [pageVal, setPageVal] = useState(1);
  const [searchVal, setSearchVal] = useState("");
  const [debouncedSearchVal, setDebouncedSearchVal] = useState("");

  const [projectStatus, setProjectStatus] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const [stackId, setStackId] = useState(null);
  const [stackData, setStackData] = useState(null);
  const [isFeatured, setIsFeatured] = useState(undefined);
  const [sortBy, setSortBy] = useState(null);

  const [tempFilter, setTempFilter] = useState({
    status: null,
    categoryId: null,
    stack: null,
    isFeatured: false,
    sortBy: null,
  });

  const [selectedProject, setSelectedProject] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openStackDialog, setOpenStackDialog] = useState(false);

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
    data: projectsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "projects",
      pageVal,
      limit,
      debouncedSearchVal,
      projectStatus,
      categoryId,
      isFeatured,
      stackId,
      sortBy,
    ],
    queryFn: () =>
      getsProjects(
        pageVal,
        limit,
        debouncedSearchVal,
        projectStatus,
        categoryId,
        isFeatured,
        stackId,
        sortBy
      ),
    staleTime: 30 * 60 * 1000,
  });

  const projects = useMemo(() => projectsData?.data || [], [projectsData]);
  const pagination = useMemo(
    () => projectsData?.metadata || {},
    [projectsData]
  );

  const tableData = useMemo(() => {
    return projects.map((item) => ({
      ...item,
      categoryName: item.category?.name || "-",
      isFeaturedText: item.isFeatured ? "Yes" : "No",
      viewCount: item.stats?.views || 0,
      likeCount: item.stats?.likes || 0,
      stacks: Array.isArray(item.stacks) ? item.stacks : [],
      createdAtFormatted: item.createdAt
        ? DateUtils.formatDateTime(item.createdAt)
        : "-",
      updatedAtFormatted: item.updatedAt
        ? DateUtils.formatDateTime(item.updatedAt)
        : "-",
    }));
  }, [projects]);

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProjects(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["projects"]);
      setSnackbar({
        open: true,
        message: res?.message || "Project deleted successfully",
        variant: "success",
      });
      setSelectedProject(null);
      setOpenDeleteDialog(false);
    },
    onError: (err) =>
      setSnackbar({ open: true, message: err, variant: "error" }),
  });

  /**
   * Applies the user-configured temporary filters to the active query state.
   * Resets the pagination to the first page.
   */
  const handleApplyFilter = useCallback(() => {
    setProjectStatus(tempFilter.status);
    setCategoryId(tempFilter.categoryId);
    setStackId(tempFilter.stack?.id || null);
    setStackData(tempFilter.stack);
    setIsFeatured(tempFilter.isFeatured ? true : undefined);
    setSortBy(tempFilter.sortBy);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, [tempFilter]);

  /**
   * Clears all filters, reverting them to their default, unselected state.
   */
  const handleResetFilter = useCallback(() => {
    setTempFilter({
      status: null,
      categoryId: null,
      stack: null,
      isFeatured: false,
      sortBy: null,
    });
    setProjectStatus(null);
    setCategoryId(null);
    setStackId(null);
    setStackData(null);
    setIsFeatured(undefined);
    setSortBy(null);
    setPageVal(1);
    setOpenFilterDialog(false);
  }, []);

  return (
    <>
      <AppTable
        title="Project Portfolio Inventory"
        headers={[
          "ID",
          "Title",
          "Stacks",
          "Category",
          "Featured",
          "Views",
          "Likes",
          "Created At",
          "Updated At",
        ]}
        data={tableData}
        isLoading={isLoading}
        selectedId={selectedProject?.id}
        searchVal={searchVal}
        onSearchChange={(e) => {
          setSearchVal(e.target.value);
          setPageVal(1);
        }}
        onRefresh={refetch}
        onCreate={() => navigate("/projects/editor/create")}
        onUpdate={(row) => navigate(`/projects/editor/${row.slug}/update`)}
        onDelete={(row) => {
          setSelectedProject(row);
          setOpenDeleteDialog(true);
        }}
        onFilter={() => {
          setTempFilter({
            status: projectStatus,
            categoryId,
            stack: stackData,
            isFeatured: !!isFeatured,
            sortBy,
          });
          setOpenFilterDialog(true);
        }}
        count={pagination.totalPages || 0}
        page={pageVal}
        onChange={(_, v) => setPageVal(v)}
        rowsPerPage={limit}
        onRowsPerPageChange={(e) => {
          setLimit(e.target.value);
          setPageVal(1);
        }}
        onRowClick={(row) =>
          setSelectedProject((prev) => (prev?.id === row.id ? null : row))
        }
        onRowDoubleClick={(row) => {
          setSelectedProject(row);
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
          <Stack key="stacks" direction="row" spacing={-1}>
            {row.stacks.slice(0, 4).map((s, i) => (
              <Tooltip key={i} title={s.name} arrow>
                <Avatar
                  src={s.icon}
                  sx={{
                    width: 24,
                    height: 24,
                    border: `2px solid ${theme.palette.background.paper}`,
                    img: { objectFit: "contain", p: 0.2 },
                  }}
                />
              </Tooltip>
            ))}
            {row.stacks.length > 4 && (
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 10,
                  bgcolor: "action.selected",
                }}
              >
                +{row.stacks.length - 4}
              </Avatar>
            )}
          </Stack>,
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
        onOpenStack={() => setOpenStackDialog(true)}
      />

      <StackListDialog
        multiple={false}
        open={openStackDialog}
        onClose={() => setOpenStackDialog(false)}
        value={tempFilter.stack}
        onChange={(val) => {
          setTempFilter((prev) => ({ ...prev, stack: val }));
          setOpenStackDialog(false);
        }}
      />

      <DeleteDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        selectedProject={selectedProject}
        onConfirm={() => deleteMutation.mutate(selectedProject.id)}
        isLoading={deleteMutation.isPending}
      />

      <DetailDialog
        open={openDetailDialog}
        onClose={() => setOpenDetailDialog(false)}
        selectedProject={selectedProject}
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

export default memo(Project);
