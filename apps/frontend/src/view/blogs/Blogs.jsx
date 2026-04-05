/**
 * @fileoverview Komponen utama untuk halaman Blog.
 * Mengelola tampilan daftar blog, filter kategori horizontal dengan infinite scroll,
 * fungsi pencarian, paginasi, serta integrasi ornamen dekorasi visual.
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Filter } from "lucide-react";

import {
  Box,
  Chip,
  useTheme,
  alpha,
  Skeleton,
  Typography,
  Badge,
  Grid,
  Container,
  Stack,
} from "@mui/material";

import {
  AppInput,
  AppPopper,
  AppCheckBox,
  AppPagination,
  IconButton,
} from "@heykyy/components";

import { BlogCard } from "@ui/card";
import { BlogSkeleton } from "@ui/skeleton";
import {
  GridPlusDeco,
  HashGlowDeco,
  DotGridDeco,
  CrossDeco,
  BoxDeco,
  HashDashedDeco,
} from "@ui/decoration";

import { getCategories } from "@api/category-api";
import { getBlogs } from "@api/blogs-api";

import { STALE_TIME } from "@heykyy/constant";
import { useDevice } from "@hooks/use-device";
import SEO from "@data/seo";
import { useAppTheme } from "@hooks/use-app-theme";

/**
 * Komponen untuk menampilkan status kosong ketika blog tidak ditemukan.
 *
 * @component
 * @returns {JSX.Element} Tampilan empty state.
 */
const BlogEmptyState = () => (
  <Stack
    direction="column"
    alignItems="center"
    justifyContent="center"
    spacing={2}
    sx={{
      width: "100%",
      minHeight: "50vh",
      textAlign: "center",
      position: "relative",
      zIndex: 1,
      px: { xs: 2, sm: 4 },
    }}
  >
    <Typography variant="h5" fontWeight="bold">
      No Blogs Found
    </Typography>
    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
      It looks like there are no blogs available at the moment. Try adjusting
      your search or filter to find what you're looking for.
    </Typography>
  </Stack>
);

/**
 * Komponen utama halaman Blog.
 *
 * @component
 * @returns {JSX.Element} Halaman blog dengan fungsionalitas filter, pencarian, dan dekorasi visual.
 */
const Blog = () => {
  const theme = useTheme();

  const scrollRef = useRef(null);
  const { isMobile } = useDevice();
  const { isDark } = useAppTheme();

  const LIMIT_BLOGS = 6;

  const [pageVal, setPageVal] = useState({ blogs: 1 });
  const [searchTemp, setSearchTemp] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const blogSEO = SEO.find((item) => item.page === "blog") || SEO.find((item) => item.page === "blog");

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchVal(searchTemp);
      setPageVal((prev) => ({ ...prev, blogs: 1 }));
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

  const {
    data: categoryData,
    isLoading: categoryLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["category-list", "BLOG"],
    queryFn: ({ pageParam = 1 }) =>
      getCategories({
        page: pageParam,
        limit: 10,
        type: "BLOG",
      }),
    getNextPageParam: (lastPage) => {
      const totalPages = lastPage?.metadata?.totalPages || 1;
      const currentPage = lastPage?.metadata?.page || 1;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: STALE_TIME,
  });

  const { data: blogData, isLoading: blogLoading } = useQuery({
    queryKey: [
      "blog-list",
      pageVal.blogs,
      LIMIT_BLOGS,
      searchVal,
      selectedCategoryId,
      activeFilter,
    ],
    queryFn: () =>
      getBlogs(
        pageVal.blogs,
        LIMIT_BLOGS,
        searchVal,
        selectedCategoryId,
        activeFilter
      ),
    staleTime: STALE_TIME,
  });

  const categories = useMemo(() => {
    return categoryData?.pages.flatMap((page) => page.data || []) || [];
  }, [categoryData]);

  const blogs = Array.isArray(blogData?.data) ? blogData.data : [];
  const pagination = blogData?.metadata || {};

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    if (scrollWidth - scrollLeft - clientWidth < 50) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleBlogPageChange = useCallback((_, value) => {
    setPageVal((prev) => ({ ...prev, blogs: value }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectCategory = useCallback((id) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
    setPageVal((prev) => ({ ...prev, blogs: 1 }));
  }, []);

  const handleFilterClick = useCallback(
    (event) => setAnchorEl(event.currentTarget),
    []
  );

  const handleFilterClose = useCallback(() => setAnchorEl(null), []);

  const handleToggleFilter = useCallback(
    (filterName) => () => {
      setActiveFilter((prev) => (prev === filterName ? null : filterName));
      setPageVal((prev) => ({ ...prev, blogs: 1 }));
    },
    []
  );

  const handleCardClick = useCallback((slug) => {
    // Logika navigasi ke detail blog
  }, []);

  const open = Boolean(anchorEl);

  const getChipStyle = (isSelected) => ({
    flexShrink: 0,
    height: 28,
    borderRadius: theme.shape.borderRadius,
    fontWeight: 400,
    fontSize: theme.typography.body2.fontSize,
    transition: theme.transitions.create(
      ["background-color", "color", "border-color"],
      { duration: theme.transitions.duration.shorter }
    ),
    bgcolor: isSelected ? "text.primary" : "transparent",
    color: isSelected ? "background.default" : "text.secondary",
    border: "0.5px solid",
    borderColor: isSelected ? "text.primary" : "divider",
    "&:hover": {
      bgcolor: isSelected
        ? alpha(theme.palette.text.primary, 0.85)
        : theme.palette.custom.surface.muted,
      color: isSelected ? "background.default" : "text.primary",
    },
    "& .MuiChip-label": {
      px: 1.5,
    },
  });

  return (
    <>
      <Helmet>
        <title>{blogSEO?.title}</title>
        {blogSEO?.description && (
          <meta name="description" content={blogSEO.description} />
        )}
        {blogSEO?.robots && <meta name="robots" content={blogSEO.robots} />}
        {blogSEO?.canonical && (
          <link rel="canonical" href={blogSEO.canonical} />
        )}
      </Helmet>

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          minHeight: "80vh",
          py: { xs: 3, md: 5 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* DEKORASI */}
        <HashDashedDeco
          sx={{
            position: "absolute",
            top: 0,
            right: { xs: "-5%", md: "5%" },
            zIndex: 0,
            opacity: 0.6,
          }}
        />
        <GridPlusDeco
          sx={{
            position: "absolute",
            top: "5%",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 0,
          }}
        />
        <HashGlowDeco
          sx={{
            position: "absolute",
            top: "20%",
            left: "-2%",
            transform: "scale(0.8)",
            opacity: 0.4,
            zIndex: 0,
          }}
        />
        <CrossDeco
          sx={{
            position: "absolute",
            top: "15%",
            right: "8%",
            transform: "scale(1.2)",
            zIndex: 0,
            opacity: 0.7,
          }}
        />
        <DotGridDeco
          sx={{
            position: "absolute",
            bottom: "10%",
            right: "2%",
            zIndex: 0,
            opacity: 0.5,
          }}
        />
        <BoxDeco
          sx={{
            position: "absolute",
            bottom: "25%",
            left: "5%",
            zIndex: 0,
            opacity: 0.4,
            transform: "rotate(15deg)",
          }}
        />

        <Stack
          direction="column"
          spacing={{ xs: 3, md: 4, lg: 5 }}
          sx={{ position: "relative", zIndex: 1 }}
        >
          {/* HEADER SECTION */}
          <Box
            sx={{
              position: "sticky",
              top: { xs: 5, md: 24 },
              width: "100%",
              boxSizing: "border-box",
              zIndex: theme.zIndex.appBar - 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "stretch", md: "center" },
                justifyContent: "space-between",
                gap: { xs: 2, md: 0 },
                position: "relative",
                overflow: "hidden",
                borderRadius: theme.shape.borderRadius,
                backgroundColor: alpha(theme.palette.background.paper, 0.75),
                backdropFilter: "blur(12px)",
                border: `0.5px solid ${theme.palette.divider}`,
                boxShadow: theme.shadows[1],
                p: { xs: 2, sm: 2.5 },
              }}
            >
              {isDark && (
                <Box
                  sx={{
                    position: "absolute",
                    top: -40,
                    left: -40,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    zIndex: -1,
                    background: `radial-gradient(circle, ${alpha(
                      theme.palette.primary.main,
                      0.08
                    )} 0%, transparent 70%)`,
                  }}
                />
              )}

              {/* KATEGORI (Chips) */}
              <Box sx={{ order: { xs: 2, md: 1 }, flex: 1, minWidth: 0 }}>
                <Box
                  ref={scrollRef}
                  onScroll={handleScroll}
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
                      sx={getChipStyle(selectedCategoryId === null)}
                    />
                  )}

                  {categoryLoading
                    ? [...Array(10)].map((_, i) => (
                        <Skeleton
                          key={`cat-skel-${i}`}
                          variant="rounded"
                          width={70}
                          height={28}
                          sx={{ flexShrink: 0, borderRadius: "8px" }}
                        />
                      ))
                    : categories.map((item) => (
                        <Chip
                          key={item.id}
                          label={item.name}
                          clickable
                          onClick={() => handleSelectCategory(item.id)}
                          sx={getChipStyle(selectedCategoryId === item.id)}
                        />
                      ))}

                  {isFetchingNextPage &&
                    [...Array(3)].map((_, i) => (
                      <Skeleton
                        key={`cat-more-skel-${i}`}
                        variant="rounded"
                        width={70}
                        height={28}
                        sx={{ flexShrink: 0, borderRadius: "8px" }}
                      />
                    ))}
                </Box>
              </Box>

              {/* SPACER KHUSUS DESKTOP (5%) */}
              <Box
                sx={{
                  order: { xs: 3, md: 2 },
                  display: { xs: "none", md: "block" },
                  width: "5%",
                  flexShrink: 0,
                }}
              />

              {/* PENCARIAN & FILTER */}
              <Box
                sx={{
                  order: { xs: 1, md: 3 },
                  width: { xs: "100%", md: "340px" },
                  flexShrink: 0,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ flexGrow: 1 }}>
                    <AppInput
                      placeholder="Search blogs..."
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
                      },
                    }}
                  >
                    <IconButton
                      onClick={handleFilterClick}
                      icon={
                        <Filter
                          size={18}
                          color={
                            activeFilter
                              ? theme.palette.primary.main
                              : theme.palette.text.primary
                          }
                        />
                      }
                      sx={{
                        width: 42,
                        height: 42,
                        flexShrink: 0,
                        bgcolor: open ? "action.selected" : "background.paper",
                        borderRadius: "12px",
                        border: `1px solid ${
                          activeFilter
                            ? theme.palette.primary.main
                            : alpha(theme.palette.divider, 0.5)
                        }`,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    />
                  </Badge>
                </Stack>

                <AppPopper
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleFilterClose}
                  placement="bottom-end"
                  offset={[10, 30]}
                >
                  <Stack
                    direction="column"
                    alignItems="flex-start"
                    spacing={1}
                    sx={{ p: 2, minWidth: 160 }}
                  >
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{
                        mb: 0.5,
                        fontSize: theme.typography.body2.fontSize,
                      }}
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
                  </Stack>
                </AppPopper>
              </Box>
            </Box>
          </Box>

          {/* BLOG GRID */}
          <Box sx={{ width: "100%" }}>
            {!blogLoading && blogs.length === 0 ? (
              <BlogEmptyState />
            ) : (
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {blogLoading
                  ? [...Array(LIMIT_BLOGS)].map((_, i) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
                        <BlogSkeleton />
                      </Grid>
                    ))
                  : blogs.map((blog) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={blog.id}>
                        <BlogCard
                          blog={blog}
                          onClick={handleCardClick}
                        />
                      </Grid>
                    ))}
              </Grid>
            )}
          </Box>

          {/* PAGINATION */}
          {!blogLoading && pagination.totalPages > 1 && (
            <Box sx={{ pt: 2, pb: 4, width: "100%" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
              >
                <AppPagination
                  count={pagination.totalPages}
                  page={pageVal.blogs}
                  onChange={handleBlogPageChange}
                  size={isMobile ? "small" : "medium"}
                />
              </Stack>
            </Box>
          )}
        </Stack>
      </Container>
    </>
  );
};

export default Blog;