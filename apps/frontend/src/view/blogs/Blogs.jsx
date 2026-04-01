/**
 * @fileoverview Komponen utama penyusun halaman Blog, mengatur daftar artikel, filter, dan pencarian.
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
  AppBlogCard,
  AppGridLayout,
  AppPagination,
} from "@heykyy/components";

import { getCategories } from "../../service/category-service";
import { getsBlogs } from "../../service/blogs-service";
import SEO from "../../data/seo";

import BlogCardSkeleton from "./components/BlogCardSkeleton";
import BlogEmptyState from "./components/BlogEmptyState";
import { DateUtils, NumberUtils } from "@heykyy/utils-frontend";

/**
 * Komponen dekorasi pola jaring bintik (dot grid).
 * @param {Object} props
 * @param {Object} props.sx - Styling material UI custom.
 * @returns {JSX.Element}
 */
const DotGridDeco = memo(({ sx }) => {
  const theme = useTheme();
  const dotColor = alpha(theme.palette.text.disabled, 0.25);

  return (
    <Box
      sx={{
        position: "absolute",
        width: 250,
        height: 250,
        zIndex: -2,
        pointerEvents: "none",
        backgroundImage: `radial-gradient(${dotColor} 2px, transparent 2px)`,
        backgroundSize: "24px 24px",
        maskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        WebkitMaskImage: "radial-gradient(circle, black 30%, transparent 70%)",
        ...sx,
      }}
    />
  );
});

/**
 * Komponen dekorasi berbentuk silang dengan efek cahaya (glow).
 * @param {Object} props
 * @param {Object} props.sx - Styling material UI custom.
 * @returns {JSX.Element}
 */
const HashGlowDeco = memo(({ sx }) => {
  const theme = useTheme();
  const color = alpha(theme.palette.divider, 0.6);
  const glowColor =
    theme.palette.mode === "dark" ? "#fff" : theme.palette.primary.main;
  const gradientV = `linear-gradient(to bottom, transparent, ${color} 20%, ${color} 80%, transparent)`;
  const gradientH = `linear-gradient(to right, transparent, ${color} 20%, ${color} 80%, transparent)`;

  return (
    <Box
      sx={{
        position: "absolute",
        width: 300,
        height: 300,
        zIndex: -2,
        pointerEvents: "none",
        ...sx,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "1px",
          height: "100%",
          left: "33%",
          background: gradientV,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "1px",
          height: "100%",
          left: "66%",
          background: gradientV,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          height: "1px",
          width: "100%",
          top: "33%",
          background: gradientH,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          height: "1px",
          width: "100%",
          top: "66%",
          background: gradientH,
        }}
      />
      {[
        { top: "33%", left: "33%" },
        { top: "33%", left: "66%" },
        { top: "66%", left: "33%" },
        { top: "66%", left: "66%" },
      ].map((pos, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: 4,
            height: 4,
            left: `calc(${pos.left} - 1.5px)`,
            top: `calc(${pos.top} - 1.5px)`,
            bgcolor: glowColor,
            boxShadow: `0 0 10px ${glowColor}`,
            borderRadius: "50%",
            opacity: 0.8,
          }}
        />
      ))}
    </Box>
  );
});

/**
 * Komponen utama penyusun halaman Blog.
 * @returns {JSX.Element}
 */
const Blogs = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";

  const limit = useMemo(() => ({ category: 200, blogs: 6 }), []);

  const [pageVal, setPageVal] = useState({ blogs: 1 });
  const [searchTemp, setSearchTemp] = useState("");
  const [searchVal, setSearchVal] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);

  const blogSEO = useMemo(() => SEO.find((item) => item.page === "blog"), []);

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

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["category-list-blog", limit.category],
    queryFn: () => getCategories(1, limit.category, "BLOG"),
    staleTime: 60000,
  });

  const { data: blogsData, isLoading: blogsLoading } = useQuery({
    queryKey: [
      "blog-list",
      pageVal.blogs,
      limit.blogs,
      searchVal,
      selectedCategoryId,
      activeFilter,
    ],
    queryFn: () =>
      getsBlogs(
        pageVal.blogs,
        limit.blogs,
        searchVal,
        selectedCategoryId,
        activeFilter
      ),
    staleTime: 60000,
  });

  const categories = useMemo(
    () => (Array.isArray(categoryData?.data) ? categoryData.data : []),
    [categoryData]
  );

  const blogs = useMemo(
    () => (Array.isArray(blogsData?.data) ? blogsData.data : []),
    [blogsData]
  );

  const pagination = useMemo(() => blogsData?.pagination || {}, [blogsData]);

  const handlePageChange = useCallback((_, value) => {
    setPageVal((prev) => ({ ...prev, blogs: value }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelectCategory = useCallback((id) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id));
    setPageVal((prev) => ({ ...prev, blogs: 1 }));
  }, []);

  const handleFilterClick = useCallback(
    (e) => setAnchorEl(e.currentTarget),
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

  const handleReadBlog = useCallback(
    (slug) => navigate(`/blog/${slug}`),
    [navigate]
  );

  const open = Boolean(anchorEl);

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
        {blogSEO?.og?.title && (
          <meta property="og:title" content={blogSEO.og.title} />
        )}
        {blogSEO?.og?.description && (
          <meta property="og:description" content={blogSEO.og.description} />
        )}
        {blogSEO?.og?.type && (
          <meta property="og:type" content={blogSEO.og.type} />
        )}
        {blogSEO?.og?.url && (
          <meta property="og:url" content={blogSEO.og.url} />
        )}
        {blogSEO?.og?.image && (
          <meta property="og:image" content={blogSEO.og.image} />
        )}
        {blogSEO?.og?.site_name && (
          <meta property="og:site_name" content={blogSEO.og.site_name} />
        )}
        {blogSEO?.twitter?.card && (
          <meta name="twitter:card" content={blogSEO.twitter.card} />
        )}
        {blogSEO?.twitter?.title && (
          <meta name="twitter:title" content={blogSEO.twitter.title} />
        )}
        {blogSEO?.twitter?.description && (
          <meta
            name="twitter:description"
            content={blogSEO.twitter.description}
          />
        )}
        {blogSEO?.twitter?.image && (
          <meta name="twitter:image" content={blogSEO.twitter.image} />
        )}
        {blogSEO?.twitter?.creator && (
          <meta name="twitter:creator" content={blogSEO.twitter.creator} />
        )}
      </Helmet>

      <AppFlexLayout direction="column" gap={5}>
        <Box
          sx={{
            position: "sticky",
            top: { xs: 5, md: 24 },
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
                    background: `radial-gradient(circle, ${alpha(
                      theme.palette.primary.main,
                      0.08
                    )} 0%, transparent 70%)`,
                  }}
                />
              </>
            )}

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
                      bgcolor:
                        selectedCategoryId === null
                          ? theme.palette.primary.main
                          : theme.palette.background.paper,
                      color:
                        selectedCategoryId === null
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.secondary,
                      border: `0.5px solid ${
                        selectedCategoryId === null
                          ? theme.palette.primary.main
                          : theme.palette.divider
                      }`,
                      "&:hover": {
                        bgcolor:
                          selectedCategoryId === null
                            ? theme.palette.primary.dark
                            : theme.palette.action.hover,
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
                          borderRadius: "12px",
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
                          fontWeight:
                            selectedCategoryId === item.id ? 600 : 450,
                          transition: "all 0.2s ease",
                          bgcolor:
                            selectedCategoryId === item.id
                              ? theme.palette.primary.main
                              : theme.palette.background.paper,
                          color:
                            selectedCategoryId === item.id
                              ? theme.palette.primary.contrastText
                              : theme.palette.text.secondary,
                          border: `0.5px solid ${
                            selectedCategoryId === item.id
                              ? theme.palette.primary.main
                              : theme.palette.divider
                          }`,
                          "&:hover": {
                            bgcolor:
                              selectedCategoryId === item.id
                                ? theme.palette.primary.dark
                                : theme.palette.action.hover,
                          },
                        }}
                      />
                    ))}
              </Box>
            </Box>

            {/* Spacer ditingkatkan menjadi 10% untuk Desktop */}
            {!isMobile && (
              <Box sx={{ order: 2, width: "10%", flexShrink: 0 }} />
            )}

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
                    placeholder="Search articles..."
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
                      border: `0.5px solid ${
                        activeFilter
                          ? theme.palette.primary.main
                          : theme.palette.divider
                      }`,
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
          <DotGridDeco
            sx={{ top: "10%", left: "5%", transform: "scale(1.5)" }}
          />
          <HashGlowDeco
            sx={{
              top: "60%",
              right: "10%",
              transform: "scale(0.8)",
              opacity: 0.4,
            }}
          />

          {!blogsLoading && blogs.length === 0 ? (
            <BlogEmptyState />
          ) : (
            <AppGridLayout
              columns={{
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              }}
              gap={4}
            >
              {blogsLoading
                ? [...Array(6)].map((_, i) => <BlogCardSkeleton key={i} />)
                : blogs.map((blog) => (
                    <AppBlogCard
                      key={blog.id}
                      blog={{
                        ...blog,
                        createdAt: DateUtils.formatDate(blog.createdAt),
                        stats: {
                          ...blog?.stats,
                          views: NumberUtils.views(blog?.stats?.views),
                        },
                      }}
                      onRead={() => handleReadBlog(blog.slug)}
                    />
                  ))}
            </AppGridLayout>
          )}
        </AppSectionLayout>

        {!blogsLoading && pagination.totalPages > 1 && (
          <AppSectionLayout paddingY={{ md: 2 }}>
            <AppFlexLayout direction="column" align="center" justify="center">
              <AppPagination
                count={pagination.totalPages}
                page={pageVal.blogs}
                onChange={handlePageChange}
                size={isMobile ? "small" : "medium"}
              />
            </AppFlexLayout>
          </AppSectionLayout>
        )}
      </AppFlexLayout>
    </>
  );
};

export default memo(Blogs);
