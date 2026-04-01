/**
 * @fileoverview Main container component for the Projects page.
 * Handles the display of the project grid, dynamic category filtering, search functionality, and pagination.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";

import {
  Box,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Skeleton,
  Typography,
  Badge,
} from "@mui/material";
import { Filter } from "lucide-react";

import {
  AppFlexLayout,
  IconButton,
  AppInput,
  AppSectionLayout,
  AppPopper,
  AppCheckBox,
  AppProjectCard,
  AppGridLayout,
  AppPagination,
} from "@heykyy/components";

import { getCategories } from "../../service/category-service";
import { getProjects } from "../../service/project-service";
import SEO from "../../data/seo";

import GridPlusDeco from "../../ui-components/GridPlusDeco";
import HashGlowDeco from "../../ui-components/HashGlowDeco";
import ProjectCardSkeleton from "./components/ProjectCardSkeleton";
import ProjectEmptyState from "./components/ProjectEmptyState";
import { DateUtils, NumberUtils } from "@heykyy/utils-frontend";

/**
 * Renders the main Projects page.
 * Integrates search, horizontal scrollable category chips, and a popper-based sorting filter.
 *
 * @returns {JSX.Element} The assembled projects view.
 */
const Project = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const limit = useMemo(() => ({ category: 200, projects: 6 }), []);

  const [pageVal, setPageVal] = useState({ projects: 1 });
  const [searchTemp, setSearchTemp] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const projectSEO = useMemo(
    () => SEO.find((item) => item.page === "projects"),
    []
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchVal(searchTemp);
      setPageVal((prev) => ({ ...prev, projects: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTemp]);

  useEffect(() => {
    if (isMobile) return;
    const el = scrollRef.current;
    if (!el) return;

    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    const startDrag = (e) => {
      isDragging = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
      el.style.userSelect = "none";
    };

    const stopDrag = () => {
      isDragging = false;
      el.style.cursor = "grab";
      el.style.removeProperty("user-select");
    };

    const onMouseDown = (e) => startDrag(e);
    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", stopDrag);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [isMobile]);

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["category-list", limit.category],
    queryFn: () => getCategories(1, limit.category, "PROJECT"),
    staleTime: 60000,
  });

  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: [
      "project-list",
      pageVal.projects,
      limit.projects,
      searchVal,
      selectedCategoryId,
      activeFilter,
    ],
    queryFn: () =>
      getProjects(
        pageVal.projects,
        limit.projects,
        searchVal,
        selectedCategoryId,
        activeFilter
      ),
    staleTime: 60000,
  });

  const categories = useMemo(() => {
    return Array.isArray(categoryData?.data) ? categoryData.data : [];
  }, [categoryData]);

  const projects = useMemo(
    () => (Array.isArray(projectData?.data) ? projectData.data : []),
    [projectData]
  );
  
  const pagination = useMemo(() => projectData?.metadata || {}, [projectData]);

  const handleProjectPageChange = useCallback((_, value) => {
    setPageVal((prev) => ({ ...prev, projects: value }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectCategory = useCallback((id) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
    setPageVal((prev) => ({ ...prev, projects: 1 }));
  }, []);

  const handleFilterClick = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    []
  );
  const handleFilterClose = useCallback(() => setAnchorEl(null), []);

  const handleToggleFilter = useCallback(
    (filterName) => () => {
      setActiveFilter((prev) => (prev === filterName ? null : filterName));
      setPageVal((prev) => ({ ...prev, projects: 1 }));
    },
    []
  );

  const handleCardClick = useCallback(
    (slug) => navigate(`/project/${slug}`),
    [navigate]
  );

  const open = Boolean(anchorEl);

  return (
    <>
      <Helmet>
        <title>{projectSEO?.title}</title>
        {projectSEO?.description && <meta name="description" content={projectSEO.description} />}
        {projectSEO?.robots && <meta name="robots" content={projectSEO.robots} />}
        {projectSEO?.canonical && <link rel="canonical" href={projectSEO.canonical} />}
      </Helmet>

      <AppFlexLayout direction="column" gap={5}>
        <Box
          sx={{
            position: "sticky",
            top: {xs : 5 ,md : 24},
            width: { xs: "85%", md: "87%" },
            boxSizing: "border-box",
            mx: { xs: 2, md: "auto" },
            zIndex: theme.zIndex.appBar - 1, 
          }}
        >
          <AppFlexLayout
            direction={isMobile ? "column" : "row"}
            align={isMobile ? "stretch" : "center"}
            justify={isMobile ? "flex-start" : "space-between"}
            gap={isMobile ? 2 : 0}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: theme.shape.borderRadius,
              backgroundColor: alpha(theme.palette.background.paper, 0.75),
              backdropFilter: "blur(12px)",
              border: `0.5px solid ${theme.palette.divider}`,
              boxShadow: theme.shadows[1],
              p: { xs: 1.5, md: 2 },
            }}
          >
            {isDark && (
              <>
                <Box
                  sx={{
                    position: "absolute",
                    top: -40,
                    left: -40,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    zIndex: -1,
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
                  }}
                />
              </>
            )}

            {/* --- Category Chips List --- */}
            <Box sx={{ order: { xs: 2, md: 1 }, flex: 1, minWidth: 0 }}>
              <Box
                ref={scrollRef}
                sx={{
                  display: "flex",
                  gap: 1.25,
                  overflowX: "auto",
                  overflowY: "hidden",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                  cursor: isMobile ? "auto" : "grab",
                  py: 0.5,
                }}
              >
                {!categoryLoading && (
                  <Chip
                    label="All"
                    clickable
                    onClick={() => handleSelectCategory(null)}
                    sx={{
                      flexShrink: 0,
                      fontWeight: selectedCategoryId === null ? 600 : 450,
                      transition: "all 0.2s ease",
                      bgcolor: selectedCategoryId === null ? theme.palette.primary.main : theme.palette.background.paper,
                      color: selectedCategoryId === null ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                      border: `0.5px solid ${selectedCategoryId === null ? theme.palette.primary.main : theme.palette.divider}`,
                      "&:hover": {
                        bgcolor: selectedCategoryId === null ? theme.palette.primary.dark : theme.palette.action.hover,
                      },
                    }}
                  />
                )}

                {categoryLoading
                  ? [...Array(5)].map((_, i) => (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        width={70}
                        height={24}
                        sx={{
                          flexShrink: 0,
                          borderRadius: '12px',
                        }}
                      />
                    ))
                  : categories.map((item) => (
                      <Chip
                        key={item.id}
                        label={item.name}
                        clickable
                        onClick={() => handleSelectCategory(item.id)}
                        sx={{
                          flexShrink: 0,
                          fontWeight: selectedCategoryId === item.id ? 600 : 450,
                          transition: "all 0.2s ease",
                          bgcolor: selectedCategoryId === item.id ? theme.palette.primary.main : theme.palette.background.paper,
                          color: selectedCategoryId === item.id ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                          border: `0.5px solid ${selectedCategoryId === item.id ? theme.palette.primary.main : theme.palette.divider}`,
                          "&:hover": {
                            bgcolor: selectedCategoryId === item.id ? theme.palette.primary.dark : theme.palette.action.hover,
                          },
                        }}
                      />
                    ))}
              </Box>
            </Box>

            {/* Spacer ditingkatkan menjadi 10% untuk Desktop */}
            {!isMobile && <Box sx={{ order: 2, width: "10%", flexShrink: 0 }} />}

            {/* --- Input & Filter Section --- */}
            <Box
              sx={{
                order: { xs: 1, md: 3 },
                width: { xs: "100%", md: "340px" },
                flexShrink: 0,
              }}
            >
              <AppFlexLayout direction="row" gap={1.5} align="center">
                
                <Box sx={{ flexGrow: 1 }}>
                  <AppInput
                    placeholder="Search projects..."
                    value={searchTemp}
                    onChange={(e) => setSearchTemp(e.target.value)}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "background.paper",
                      },
                    }}
                  />
                </Box>

                <Badge 
                  color="primary" 
                  variant="dot" 
                  invisible={!activeFilter}
                  sx={{
                    "& .MuiBadge-badge": {
                      right: 4,
                      top: 4,
                    }
                  }}
                >
                  <IconButton
                    onClick={handleFilterClick}
                    icon={<Filter size={18} color={activeFilter ? theme.palette.primary.main : theme.palette.text.primary} />}
                    sx={{
                      width: 42,
                      height: 42,
                      flexShrink: 0,
                      bgcolor: open ? "action.selected" : "background.paper",
                      borderRadius: "12px",
                      border: `0.5px solid ${activeFilter ? theme.palette.primary.main : theme.palette.divider}`,
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  />
                </Badge>
              </AppFlexLayout>

              <AppPopper
                open={open}
                anchorEl={anchorEl}
                onClose={handleFilterClose}
                placement="bottom-end"
                offset={[0, 16]}
              >
                <AppFlexLayout
                  direction="column"
                  align="flex-start"
                  gap={1}
                  sx={{ p: 2, minWidth: 160 }}
                >
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontSize: theme.typography.body2.fontSize }}
                  >
                    Sort by
                  </Typography>
                  <AppCheckBox
                    value={activeFilter === "most_liked"}
                    onChange={handleToggleFilter("most_liked")}
                    label="Most Liked"
                  />
                  <AppCheckBox
                    value={activeFilter === "popular"}
                    onChange={handleToggleFilter("popular")}
                    label="Most Viewed"
                  />
                </AppFlexLayout>
              </AppPopper>
            </Box>
          </AppFlexLayout>
        </Box>

        <AppSectionLayout
          paddingY={0}
          sx={{ position: "relative", minHeight: "50vh", mt: { xs: 2, md: 4 } }}
        >
          <GridPlusDeco
            sx={{ top: "10%", left: "50%", transform: "translateX(-50%)" }}
          />
          <HashGlowDeco
            sx={{
              top: "40%",
              left: "5%",
              transform: "scale(0.8)",
              opacity: 0.4,
            }}
          />

          {!projectLoading && projects.length === 0 ? (
            <ProjectEmptyState />
          ) : (
            <AppGridLayout
              columns={{ xs: "1fr", sm: "1fr", md: "repeat(3, 1fr)" }}
              gap={4}
            >
              {projectLoading
                ? [...Array(6)].map((_, i) => <ProjectCardSkeleton key={i} />)
                : projects.map((project) => (
                    <AppProjectCard
                      key={project.id}
                      project={{
                        ...project,
                        createdAt: DateUtils.formatDate(project.createdAt),
                        stats: {
                          ...project?.stats,
                          views: NumberUtils.views(project?.stats?.views),
                        },
                      }}
                      onClick={handleCardClick}
                    />
                  ))}
            </AppGridLayout>
          )}
        </AppSectionLayout>

        {!projectLoading && pagination.totalPages > 1 && (
          <AppSectionLayout paddingY={{ md: 2 }}>
            <AppFlexLayout direction="column" align="center" justify="center">
              <AppPagination
                count={pagination.totalPages}
                page={pageVal.projects}
                onChange={handleProjectPageChange}
                size={isMobile ? "small" : "medium"}
              />
            </AppFlexLayout>
          </AppSectionLayout>
        )}
      </AppFlexLayout>
    </>
  );
};

export default memo(Project);