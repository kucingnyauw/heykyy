import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getsDashboard } from "../../services/dashboard-service";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Sector,
} from "recharts";
import {
  Card,
  useTheme,
  Box,
  Typography,
  Menu,
  MenuItem,
  alpha,
} from "@mui/material";
import {
  AppFlexLayout,
  AppGridLayout,
  AppAutoComplete,
  IconButton,
} from "@heykyy/components";
import {
  Users,
  FileText,
  FolderGit2,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  BarChart2,
  PieChart as PieChartIcon,
  RefreshCcw,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DateUtils } from "@heykyy/utils-frontend";

import DashboardSkeleton from "./components/DashboardSkeleton";
import StatCard from "./components/StatCard";
import TopListItem from "./components/TopListItem";

/**
 * Custom active shape for the Donut Chart.
 * Creates a "pop-out" and glowing ring effect on hover.
 *
 * @param {Object} props - Active shape rendering properties provided by Recharts.
 * @returns {JSX.Element}
 */
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 18}
        fill={fill}
        opacity={0.2}
        cornerRadius={8}
      />
    </g>
  );
};

/**
 * Main Dashboard view component.
 * Aggregates statistics, displays analytical charts, and shows top performing content.
 *
 * @returns {JSX.Element} The administrative dashboard.
 */
const DashBoard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [periodic, setPeriodic] = useState("daily");
  const [chartTab, setChartTab] = useState("blogs");
  const [pieTab, setPieTab] = useState("blogs");
  const [pieActiveIndex, setPieActiveIndex] = useState(0);

  const [chartMenuAnchor, setChartMenuAnchor] = useState(null);
  const [pieMenuAnchor, setPieMenuAnchor] = useState(null);

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["dashboard", periodic],
    queryFn: () => getsDashboard(periodic),
    staleTime: 30 * 60 * 1000,
  });

  const chartData = useMemo(() => {
    if (!dashboardData?.trends) return [];
    const blogsTrend = Array.isArray(dashboardData.trends.blogs)
      ? dashboardData.trends.blogs
      : [];
    const projectsTrend = Array.isArray(dashboardData.trends.projects)
      ? dashboardData.trends.projects
      : [];
    const allDates = new Set([
      ...blogsTrend.map((i) => i.date),
      ...projectsTrend.map((i) => i.date),
    ]);
    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    return sortedDates.map((date) => ({
      dateStr: DateUtils.formatShortDate(date),
      blogs: blogsTrend.find((b) => b.date === date)?.count || 0,
      projects: projectsTrend.find((p) => p.date === date)?.count || 0,
    }));
  }, [dashboardData]);

  const pieData = useMemo(() => {
    const statusObj = dashboardData?.status;
    const targetData =
      pieTab === "blogs" ? statusObj?.blogs : statusObj?.projects;
    return Array.isArray(targetData)
      ? targetData.map((s) => ({ name: s.status, value: s.count }))
      : [];
  }, [dashboardData, pieTab]);

  const PIE_COLORS = useMemo(
    () => [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.success.main,
      theme.palette.error.main,
      theme.palette.text.primary,
    ],
    [theme]
  );

  const activeChartColor = useMemo(
    () =>
      chartTab === "blogs"
        ? theme.palette.primary.main
        : theme.palette.info.main,
    [chartTab, theme]
  );

  /**
   * Updates the selected analytical periodic filter.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The input change event.
   */
  const handlePeriodicChange = useCallback(
    (e) => setPeriodic(e.target.value),
    []
  );

  /**
   * Navigates to a targeted route within the application.
   *
   * @param {string} path - The destination URL path.
   */
  const handleNavigate = useCallback((path) => navigate(path), [navigate]);

  /**
   * Opens the configuration menu for the area chart.
   *
   * @param {React.MouseEvent<HTMLElement>} e - The mouse event.
   */
  const handleChartMenuOpen = useCallback(
    (e) => setChartMenuAnchor(e.currentTarget),
    []
  );

  /**
   * Closes the area chart configuration menu.
   */
  const handleChartMenuClose = useCallback(() => setChartMenuAnchor(null), []);

  /**
   * Updates the targeted dataset for the area chart and closes the menu.
   *
   * @param {string} type - The entity type to display.
   */
  const handleChartTabSelect = useCallback((type) => {
    setChartTab(type);
    setChartMenuAnchor(null);
  }, []);

  /**
   * Opens the configuration menu for the donut chart.
   *
   * @param {React.MouseEvent<HTMLElement>} e - The mouse event.
   */
  const handlePieMenuOpen = useCallback(
    (e) => setPieMenuAnchor(e.currentTarget),
    []
  );

  /**
   * Closes the donut chart configuration menu.
   */
  const handlePieMenuClose = useCallback(() => setPieMenuAnchor(null), []);

  /**
   * Updates the targeted dataset for the donut chart, resets the active segment index, and closes the menu.
   *
   * @param {string} type - The entity type to display.
   */
  const handlePieTabSelect = useCallback((type) => {
    setPieTab(type);
    setPieActiveIndex(0);
    setPieMenuAnchor(null);
  }, []);

  /**
   * Identifies and registers the active segment of the donut chart for interaction highlighting.
   *
   * @param {Object} _ - The synthetic event (unused).
   * @param {number} index - The index of the hovered pie segment.
   */
  const onPieEnter = useCallback((_, index) => {
    setPieActiveIndex(index);
  }, []);

  const menuPaperProps = {
    elevation: 0,
    sx: {
      mt: 1,
      minWidth: 160,
      border: `1px solid ${theme.palette.divider}`,
      boxShadow: `0px 8px 24px ${alpha(theme.palette.common.black, 0.12)}`,
      "& .MuiMenuItem-root": {
        px: 2,
        py: 1.2,
        fontSize: theme.typography.body2.fontSize,
        transition: "all 0.2s ease",
        borderRadius: 1,
        mx: 0.5,
        my: 0.25,
      },
    },
  };

  const glassTooltipStyle = {
    backgroundColor: alpha(theme.palette.background.paper, 0.85),
    backdropFilter: "blur(12px)",
    borderRadius: "8px",
    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
    boxShadow: `0px 4px 20px ${alpha(theme.palette.common.black, 0.1)}`,
    fontSize: "0.85rem",
    padding: "8px 14px",
    fontWeight: 600,
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <AppFlexLayout
      direction="column"
      gap={{ xs: 3, md: 4 }}
      align="stretch"
      sx={{ width: "100%", pb: 4 }}
    >
      <AppFlexLayout
        justify="space-between"
        align="center"
        wrap="nowrap"
        gap={2}
        sx={{ width: "100%" }}
      >
        <Box sx={{ flex: { xs: 6, sm: 1 }, minWidth: 0 }}>
          <Typography variant="h4" noWrap sx={{ mb: 0.5 }}>
            Overview
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Real-time analytics and performance metrics.
          </Typography>
        </Box>

        <AppFlexLayout
          gap={1.5}
          align="center"
          justify="flex-end"
          sx={{ flex: { xs: 4, sm: "initial" }, minWidth: 0 }}
        >
          <IconButton
          size="medium"
            sx={{ height: 40, width: 40, flexShrink: 0 }}
            onClick={() => refetch()}
            icon={
              <RefreshCcw
                size={18}
                strokeWidth={1.5}
                color={theme.palette.text.secondary}
              />
            }
          />
          <AppAutoComplete
            options={["daily", "weekly", "monthly", "yearly"]}
            value={periodic}
            onChange={handlePeriodicChange}
            disableClearable
            disableTyping={true}
            size="small"
            sx={{
              flex: { xs: 1, sm: "none" },
              width: { xs: "auto", sm: 140 },
              minWidth: 0,
            }}
          />
        </AppFlexLayout>
      </AppFlexLayout>

      <AppGridLayout
        columns={{ xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
        gap={3}
        sx={{ width: "100%" }}
      >
        <StatCard
          title="Total Users"
          value={dashboardData?.summary?.users}
          icon={Users}
          colorRaw={theme.palette.primary.main}
        />
        <StatCard
          title="Total Blogs"
          value={dashboardData?.summary?.blogs}
          icon={FileText}
          colorRaw={theme.palette.primary.main}
        />
        <StatCard
          title="Total Projects"
          value={dashboardData?.summary?.projects}
          icon={FolderGit2}
          colorRaw={theme.palette.info.main}
        />
        <StatCard
          title="Total Views"
          value={dashboardData?.summary?.views}
          icon={Eye}
          colorRaw={theme.palette.success.main}
        />
      </AppGridLayout>

      <AppGridLayout
        columns={{ xs: "1fr", lg: "2fr 1fr" }}
        gap={3}
        sx={{ width: "100%" }}
      >
        <Card
          sx={{
            p: 0,
            minHeight: { xs: 390, md: 490 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              borderBottom: `0.5px solid ${theme.palette.divider}`,
            }}
          >
            <AppFlexLayout
              justify="space-between"
              align="center"
              sx={{ width: "100%" }}
            >
              <AppFlexLayout gap={2} align="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(activeChartColor, 0.1),
                    color: activeChartColor,
                  }}
                >
                  <BarChart2 size={20} strokeWidth={1.5} />
                </Box>
                <Box>
                  <Typography variant="body1">Analytics Trend</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Showing data for{" "}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.primary"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {chartTab}
                    </Typography>
                  </Typography>
                </Box>
              </AppFlexLayout>

              <IconButton
                size="medium"
                onClick={handleChartMenuOpen}
                icon={<MoreHorizontal size={20} strokeWidth={1.5} />}
              />
            </AppFlexLayout>

            <Menu
              anchorEl={chartMenuAnchor}
              open={Boolean(chartMenuAnchor)}
              onClose={handleChartMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={menuPaperProps}
            >
              {["blogs", "projects"].map((type) => (
                <MenuItem
                  key={type}
                  onClick={() => handleChartTabSelect(type)}
                  sx={{
                    justifyContent: "space-between",
                    bgcolor:
                      chartTab === type
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                    color:
                      chartTab === type
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                  }}
                >
                  <Typography
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: chartTab === type ? 600 : 400,
                    }}
                  >
                    {type}
                  </Typography>
                  {chartTab === type && <Check size={16} strokeWidth={2.5} />}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box
            flex={1}
            width="100%"
            minHeight={0}
            sx={{ p: { xs: 2, md: 3 }, pt: { xs: 3, md: 4 } }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={activeChartColor}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={activeChartColor}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke={theme.palette.divider}
                />
                <XAxis
                  dataKey="dateStr"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                  dy={12}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                  dx={-5}
                />
                <Tooltip
                  contentStyle={glassTooltipStyle}
                  cursor={{
                    stroke: alpha(activeChartColor, 0.4),
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={chartTab}
                  stroke={activeChartColor}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorActive)"
                  animationDuration={1000}
                  activeDot={{
                    r: 6,
                    strokeWidth: 0,
                    fill: activeChartColor,
                    boxShadow: `0 0 10px ${activeChartColor}`,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Box>
        </Card>

        <Card
          sx={{
            p: 0,
            minHeight: { xs: 390, md: 490 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              borderBottom: `0.5px solid ${theme.palette.divider}`,
            }}
          >
            <AppFlexLayout
              justify="space-between"
              align="center"
              sx={{ width: "100%" }}
            >
              <AppFlexLayout gap={2} align="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.main,
                  }}
                >
                  <PieChartIcon size={20} strokeWidth={1.5} />
                </Box>
                <Box>
                  <Typography variant="body1">Status Distribution</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Overview for{" "}
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.primary"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {pieTab}
                    </Typography>
                  </Typography>
                </Box>
              </AppFlexLayout>
              <IconButton
                size="medium"
                onClick={handlePieMenuOpen}
                icon={<MoreHorizontal size={20} strokeWidth={1.5} />}
              />
            </AppFlexLayout>

            <Menu
              anchorEl={pieMenuAnchor}
              open={Boolean(pieMenuAnchor)}
              onClose={handlePieMenuClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={menuPaperProps}
            >
              {["blogs", "projects"].map((type) => (
                <MenuItem
                  key={type}
                  onClick={() => handlePieTabSelect(type)}
                  sx={{
                    justifyContent: "space-between",
                    bgcolor:
                      pieTab === type
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                    color:
                      pieTab === type
                        ? theme.palette.primary.main
                        : theme.palette.text.primary,
                  }}
                >
                  <Typography
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: pieTab === type ? 600 : 400,
                    }}
                  >
                    {type}
                  </Typography>
                  {pieTab === type && <Check size={16} strokeWidth={2.5} />}
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flex: 1, position: "relative", p: { xs: 2, md: 3 } }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={pieActiveIndex}
                  activeShape={renderActiveShape}
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={95}
                  paddingAngle={6}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                  onMouseEnter={onPieEnter}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={glassTooltipStyle}
                  itemStyle={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 12,
                    paddingTop: 16,
                    color: theme.palette.text.primary,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -65%)",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <Typography variant="h3" fontWeight={700}>
                {pieData.reduce((acc, curr) => acc + curr.value, 0)}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.7rem", letterSpacing: "0.1em" }}
              >
                TOTAL
              </Typography>
            </Box>
          </Box>
        </Card>
      </AppGridLayout>

      <AppGridLayout
        columns={{ xs: "1fr", md: "1fr 1fr" }}
        gap={3}
        sx={{ width: "100%" }}
      >
        {["blogs", "projects"].map((type) => {
          const items = Array.isArray(dashboardData?.top?.[type])
            ? dashboardData.top[type]
            : [];
          const isBlog = type === "blogs";
          const accentColor = isBlog
            ? theme.palette.success.main
            : theme.palette.info.main;

          return (
            <Card
              key={type}
              sx={{ p: 0, display: "flex", flexDirection: "column" }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  borderBottom: `0.5px solid ${theme.palette.divider}`,
                }}
              >
                <AppFlexLayout
                  justify="space-between"
                  align="center"
                  sx={{ width: "100%" }}
                >
                  <AppFlexLayout gap={2} align="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(accentColor, 0.1),
                        color: accentColor,
                      }}
                    >
                      {isBlog ? (
                        <FileText size={20} strokeWidth={1.5} />
                      ) : (
                        <FolderGit2 size={20} strokeWidth={1.5} />
                      )}
                    </Box>
                    <Box>
                      <Typography variant="body1">
                        Top {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Based on performance metrics
                      </Typography>
                    </Box>
                  </AppFlexLayout>
                  <IconButton
                    size="medium"
                    onClick={() => handleNavigate(`/${type}`)}
                    icon={<ArrowUpRight size={20} strokeWidth={1.5} />}
                  />
                </AppFlexLayout>
              </Box>

              <Box sx={{ p: 2, flex: 1 }}>
                {items.length > 0 ? (
                  <AppFlexLayout
                    direction="column"
                    gap={1}
                    align="stretch"
                    sx={{ width: "100%" }}
                  >
                    {items.slice(0, 5).map((item, idx) => (
                      <TopListItem
                        key={item.id}
                        rank={idx + 1}
                        title={item.title}
                        date={item.createdAt}
                        color={accentColor}
                        meta={isBlog ? item.viewCount : item.likeCount}
                      />
                    ))}
                  </AppFlexLayout>
                ) : (
                  <AppFlexLayout
                    direction="column"
                    align="center"
                    justify="center"
                    sx={{ py: 6, opacity: 0.5, width: "100%" }}
                  >
                    <BarChart2 size={36} strokeWidth={1} />
                    <Typography variant="body2" sx={{ mt: 1.5 }}>
                      No data available
                    </Typography>
                  </AppFlexLayout>
                )}
              </Box>
            </Card>
          );
        })}
      </AppGridLayout>
    </AppFlexLayout>
  );
};

export default DashBoard;