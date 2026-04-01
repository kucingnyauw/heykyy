import React, { useState, useEffect, useCallback, memo, useMemo } from "react";
import {
  Box,
  Collapse,
  useTheme,
  Drawer,
  Typography,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  Divider,
  useMediaQuery,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link, useLocation } from "react-router-dom";
import {
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  HEIGHT_APPBAR,
} from "@heykyy/constant";
import { useSelector, useDispatch } from "react-redux";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import menuItems from "../../menu-items";
import {
  selectSidebarCollapsed,
  selectSidebarMobileOpen,
} from "../../store/sidebar/sidebar-selector";
import { toggleMobile } from "../../store/sidebar/sidebar-slice";
import { IconButton, AppLogo, AppFlexLayout } from "@heykyy/components";

/**
 * Custom styled Material-UI Drawer for a collapsible mini-variant sidebar.
 */
const MiniDrawerStyled = styled(Drawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& .MuiDrawer-paper": {
    top: HEIGHT_APPBAR,
    height: `calc(100% - ${HEIGHT_APPBAR}px)`,
    width: open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
    border: "none",
    borderRight: `0.5px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
    overflowX: "hidden",
  },
}));

/**
 * Recursive menu item component.
 * Uses align="stretch" on layouts to ensure items occupy 100% width.
 */
const MenuItem = memo(({ item, isCollapsed, level = 0, onItemClick }) => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isSelected = useMemo(() => {
    if (item.url) return location.pathname === item.url;
    if (item.type === "collapse") {
      return item.children?.some((child) => location.pathname === child.url);
    }
    return false;
  }, [location.pathname, item.url, item.type, item.children]);

  useEffect(() => {
    if (item.type === "collapse" && isSelected) {
      setOpen(true);
    }
  }, [isSelected, item.type]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const Icon = item.icon;
  const itemIcon = Icon ? (
    <Icon size={18} strokeWidth={isSelected ? 2 : 1.5} />
  ) : null;

  if (item.type === "group") {
    return (
      <Box sx={{ width: "100%", mb: 1, mt: level === 0 ? 1 : 0 }}>
        {!isCollapsed && item.title && (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 1.5,
              display: "block",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              color: theme.palette.text.secondary,
              fontSize: "0.65rem",
            }}
          >
            {item.title}
          </Typography>
        )}
        <AppFlexLayout direction="column" gap={0.5} align="stretch">
          {item.children?.map((child) => (
            <MenuItem
              key={child.id}
              item={child}
              isCollapsed={isCollapsed}
              level={level}
              onItemClick={onItemClick}
            />
          ))}
        </AppFlexLayout>
      </Box>
    );
  }

  const listItemContent = (
    <ListItemButton
      component={item.url ? Link : "div"}
      to={item.url || undefined}
      onClick={item.type === "collapse" ? handleToggle : onItemClick}
      selected={isSelected}
      sx={{
        minHeight: 40,
        width: "100%",
        mx: 0,
        borderRadius: "10px",
        mb: 0.5,
        color: isSelected
          ? theme.palette.primary.main
          : theme.palette.text.secondary,
        bgcolor: isSelected
          ? alpha(theme.palette.primary.main, 0.08)
          : "transparent",
        transition: "all 0.2s ease",
        "&.Mui-selected": {
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.main,
          "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
        },
        "&:hover": {
          bgcolor: isSelected
            ? alpha(theme.palette.primary.main, 0.12)
            : theme.palette.custom.surface.muted,
          color: isSelected
            ? theme.palette.primary.main
            : theme.palette.text.primary,
        },
        justifyContent: isCollapsed ? "center" : "initial",
        pl: level > 0 && !isCollapsed ? 4.5 : 2,
        px: isCollapsed ? 0 : undefined,
      }}
    >
      <ListItemIcon
        sx={{
          minWidth: 0,
          mr: isCollapsed ? 0 : 2,
          color: "inherit",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {itemIcon}
      </ListItemIcon>
      {!isCollapsed && (
        <>
          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              variant: "body2",
              fontWeight: isSelected ? 600 : 500,
              sx: { letterSpacing: "0.01em" },
            }}
          />
          {item.type === "collapse" &&
            (open ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </>
      )}
    </ListItemButton>
  );

  const wrappedContent =
    isCollapsed && item.title ? (
      <Tooltip title={item.title} placement="right" arrow>
        {listItemContent}
      </Tooltip>
    ) : (
      listItemContent
    );

  if (item.type === "collapse") {
    return (
      <Box sx={{ width: "100%" }}>
        {wrappedContent}
        <Collapse in={open && !isCollapsed} timeout="auto" unmountOnExit>
          <AppFlexLayout
            direction="column"
            gap={0.5}
            align="stretch"
            sx={{ mt: 0.5 }}
          >
            {item.children?.map((child) => (
              <MenuItem
                key={child.id}
                item={child}
                isCollapsed={isCollapsed}
                level={level + 1}
                onItemClick={onItemClick}
              />
            ))}
          </AppFlexLayout>
        </Collapse>
      </Box>
    );
  }

  return wrappedContent;
});

MenuItem.displayName = "MenuItem";

/**
 * Main Sidebar component.
 */
const Sidebar = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const isCollapsed = useSelector(selectSidebarCollapsed);
  const isMobileOpen = useSelector(selectSidebarMobileOpen);

  const handleMobileToggle = useCallback(() => {
    dispatch(toggleMobile());
  }, [dispatch]);

  const isVisualCollapsed = matchDownMd ? false : isCollapsed;

  const drawerContent = useMemo(
    () => (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
        }}
      >
        {matchDownMd && (
          <AppFlexLayout
            justify="space-between"
            align="center"
            sx={{
              p: 2,
              height: HEIGHT_APPBAR,
              borderBottom: `0.5px solid ${theme.palette.divider}`,
            }}
          >
            <AppLogo />
            <IconButton
              icon={<X size={20} />}
              onClick={handleMobileToggle}
              size="medium"
              sx={{ color: "text.secondary", bgcolor: "transparent" }}
            />
          </AppFlexLayout>
        )}

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            py: 2,
            px: isVisualCollapsed ? 1 : 2,
            "&::-webkit-scrollbar": { width: "4px" },
            "&::-webkit-scrollbar-thumb": {
              background: alpha(theme.palette.divider, 0.2),
              borderRadius: theme.shape.borderRadius,
            },
          }}
        >
          {menuItems.items.map((groupArray, index) => (
            <Box key={`menu-group-${index}`}>
              {groupArray.map((group) => (
                <MenuItem
                  key={group.id}
                  item={group}
                  isCollapsed={isVisualCollapsed}
                  level={0}
                  onItemClick={matchDownMd ? handleMobileToggle : undefined}
                />
              ))}
              {index < menuItems.items.length - 1 && (
                <Divider
                  sx={{
                    my: 1.5,
                    mx: 0,
                    borderStyle: "dashed",
                    borderColor: theme.palette.divider,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    ),
    [matchDownMd, isVisualCollapsed, handleMobileToggle, theme]
  );

  return matchDownMd ? (
    <Drawer
      variant="temporary"
      open={isMobileOpen}
      onClose={handleMobileToggle}
      ModalProps={{ keepMounted: true }}
      sx={{
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH_EXPANDED,
          borderRight: "none",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <MiniDrawerStyled variant="permanent" open={!isCollapsed}>
      {drawerContent}
    </MiniDrawerStyled>
  );
};

export default memo(Sidebar);
