import React, { useState, useMemo, memo } from "react";
import {
  alpha,
  useTheme,
  AppBar,
  Toolbar,
  Box,
  useMediaQuery,
  Typography,
  ButtonBase,
  Divider,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  IconButton,
  AppLogo,
  AppFlexLayout,
  AppPopper,
  AppProfileAvatar,
  AppSwitch,
} from "@heykyy/components";
import {
  HEIGHT_APPBAR,
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
  ROLE,
} from "@heykyy/constant";
import { Menu, Sun, Moon, Settings, LogOut } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleTheme } from "../../store/theme/theme-slice";
import {
  toggleMobile,
  toggleCollapsed,
} from "../../store/sidebar/sidebar-slice";
import { selectSidebarCollapsed } from "../../store/sidebar/sidebar-selector";
import { selectAuthUser } from "../../store/auth/auth-selectors";
import { logout } from "../../store/auth/auth-thunk";
import { DateUtils } from "@heykyy/utils-frontend";

/**
 * Application Header component.
 * Handles layout toggling, theme switching, and user profile management.
 * Features a glassmorphism effect and responsive sidebar width synchronization.
 *
 * @returns {JSX.Element} The rendered Header component.
 */
const Header = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const isCollapsed = useSelector(selectSidebarCollapsed);
  const user = useSelector(selectAuthUser);

  const greetingText = useMemo(() => DateUtils.greeting(), []);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleDrawerToggle = () =>
    isMobile ? dispatch(toggleMobile()) : dispatch(toggleCollapsed());

  const handleOpenPopper = (event) => setAnchorEl(event.currentTarget);
  const handleClosePopper = () => setAnchorEl(null);

  const handleLogout = () => {
    dispatch(logout());
    handleClosePopper();
  };

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_EXPANDED;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: "blur(12px)",
        borderBottom: `1px dashed ${theme.palette.divider}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          px: isCollapsed ? 2 : 3,
          minHeight: `${HEIGHT_APPBAR}px`,
        }}
      >
        <Box
          sx={{
            width: isMobile ? "auto" : currentSidebarWidth - 32,
            display: "flex",
            alignItems: "center",
            gap: 2,
            justifyContent: "space-between",
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          }}
        >
          {!isMobile && !isCollapsed && <AppLogo />}
          <IconButton
            onClick={handleDrawerToggle}
            size="medium"
            sx={{
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
            }}
            icon={<Menu size={20} strokeWidth={1.5} />}
          />
        </Box>

        <AppFlexLayout justify="flex-end" align="center" sx={{ flexGrow: 1 }}>
          <ButtonBase
            onClick={handleOpenPopper}
            sx={{
              p: 0.5,
              borderRadius: "99px",
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                transform: "translateY(-1px)",
              },
            }}
          >
            <AppFlexLayout gap={1} align="center" sx={{ pr: 1 }}>
              <AppProfileAvatar
                profileUrl={user?.avatar}
                displayName={user?.name}
                size="medium"
              />
              <Settings size={18} style={{ opacity: 0.6 }} strokeWidth={1.5} />
            </AppFlexLayout>
          </ButtonBase>
        </AppFlexLayout>

        <AppPopper
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopper}
          placement="bottom-end"
          sx={{ mt: 1.5, minWidth: 260, p: 1 }}
        >
          <AppFlexLayout direction="column" gap={0.5} align="stretch">
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {greetingText}, {user?.name || "User"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.2, fontWeight: 500 }}
              >
                {  user?.role ? ROLE[user.role.toUpperCase()] : ROLE.USER}
              </Typography>
            </Box>

            <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />

            <AppFlexLayout direction="column" gap={0.5} align="stretch">
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleClosePopper();
                }}
                sx={{ borderRadius: "8px", py: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Settings size={18} strokeWidth={1.5} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500}>
                      Account Settings
                    </Typography>
                  }
                />
              </MenuItem>

              <MenuItem
                disableRipple
                sx={{
                  borderRadius: "8px",
                  py: 1,
                  cursor: "default",
                  "&:hover": { bgcolor: "transparent" },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {isDark ? (
                    <Moon size={18} strokeWidth={1.5} />
                  ) : (
                    <Sun size={18} strokeWidth={1.5} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500}>
                      Dark Mode
                    </Typography>
                  }
                />
                <AppSwitch
                  checked={isDark}
                  onChange={() => dispatch(toggleTheme())}
                />
              </MenuItem>
            </AppFlexLayout>

            <Divider sx={{ borderStyle: "dashed", my: 0.5 }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: "8px",
                py: 1,
                color: "error.main",
                "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.08) },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogOut size={18} strokeWidth={2} color={theme.palette.error.main} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={700}>
                    Sign Out
                  </Typography>
                }
              />
            </MenuItem>
          </AppFlexLayout>
        </AppPopper>
      </Toolbar>
    </AppBar>
  );
};

export default memo(Header);