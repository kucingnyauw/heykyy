/**
 * @fileoverview Main navigation header (Navbar) component for the application.
 * Handles responsive layouts, providing a top App Bar for desktop and a slide-out drawer for mobile screens.
 */

import React, { useEffect, useMemo, useState, useCallback, memo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  AppBar,
  Toolbar,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  MenuItem,
  ListItemIcon,
  Typography,
  Divider,
  ListItemText,
} from "@mui/material";
import { Menu, Moon, Sun, X, Settings, LogOut } from "lucide-react";

import {
  IconButton,
  FilledButton,
  AppLogo,
  AppFlexLayout,
  TextButton,
  AppProfileAvatar,
  AppPopper,
  AppSwitch
} from "@heykyy/components";

import { navbarMenu } from "../../menu-items";
import { toggleTheme } from "../../store/theme/theme-slice";
import { logout } from "../../store/auth/auth-thunk";
import {
  selectAuthUser,
  selectIsAuthenticated,
} from "../../store/auth/auth-selectors";
import { HEIGHT_APPBAR, ROLE } from "@heykyy/constant";
import { DateUtils } from "@heykyy/utils-frontend";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  const open = Boolean(anchorEl);

  const greetingText = useMemo(() => DateUtils.greeting(), []);

  const toggleDrawer = useCallback(() => setMobileOpen((prev) => !prev), []);
  const handleOpenPopper = useCallback((e) => setAnchorEl(e.currentTarget), []);
  const handleClosePopper = useCallback(() => setAnchorEl(null), []);

  const handleToggleTheme = useCallback(
    () => dispatch(toggleTheme()),
    [dispatch]
  );

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled((prev) => (prev !== isScrolled ? isScrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const drawerContent = useMemo(
    () => (
      <AppFlexLayout
        direction="column"
        align="center"
        sx={{
          width: "100%",
          maxHeight: "80dvh",
          background: `radial-gradient(circle at top right, ${alpha(theme.palette.primary.main, 0.05)}, transparent), ${theme.palette.background.default}`,
          position: "relative",
          overflow: "hidden", 
        }}
      >
        <AppFlexLayout
          justify="center"
          align="center"
          sx={{ 
            p: 2.5, 
            width: "100%", 
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`, 
            flexShrink: 0 
          }}
        >
          <AppLogo size="large" />
        </AppFlexLayout>

        <Box
          sx={{
            flex: 1,
            width: "100%",
            maxWidth: 600, 
            overflowY: "auto",
            py: 2, 
          }}
        >
          <List sx={{ width: "100%", px: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            {navbarMenu.map((item) => {
              const active = location.pathname === item.path;
              return (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    onClick={toggleDrawer}
                    sx={{
                      borderRadius: theme.shape.borderRadius * 1.5,
                      py: 1.5, 
                      px: 2.5,
                      justifyContent: "center", 
                      position: 'relative',
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      bgcolor: "transparent", 
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        transform: "translateY(-2px)", 
                      },
                    }}
                  >
                    <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
                      {/* Indikator Glowing Dot saat Active */}
                      {active && (
                        <Box
                          sx={{
                            position: "absolute",
                            left: -20, // Jarak dot ke teks
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: theme.palette.primary.main,
                            boxShadow: `0 0 10px 2px ${alpha(theme.palette.primary.main, 0.6)}`,
                            animation: "pulse 2s infinite ease-in-out",
                            "@keyframes pulse": {
                              "0%": { opacity: 0.7, transform: "scale(0.8)" },
                              "50%": { opacity: 1, transform: "scale(1.2)" },
                              "100%": { opacity: 0.7, transform: "scale(0.8)" },
                            }
                          }}
                        />
                      )}
                      <Typography
                        variant="h6"
                        sx={{
                          fontSize: active ? '1.15rem' : '1.05rem', // Membesar sedikit saat active
                          fontWeight: active ? 700 : 500,
                          color: active ? theme.palette.primary.main : theme.palette.text.primary,
                          letterSpacing: active ? '0.02em' : '0',
                          textAlign: "center",
                          transition: "all 0.3s ease",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            width: "100%",
            maxWidth: 600,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <AppFlexLayout 
            justify="space-between" 
            align="center" 
            sx={{ 
              px: 3, 
              py: 1.5, 
              borderRadius: '16px',
              bgcolor: alpha(theme.palette.text.primary, 0.03),
              border: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            }}
          >
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
              {theme.palette.mode === "dark" ? "Dark Mode" : "Light Mode"}
            </Typography>
            <AppSwitch 
              onChange={handleToggleTheme} 
              checked={theme.palette.mode === "dark"} 
            />
          </AppFlexLayout>

          {isAuthenticated ? (
            <AppFlexLayout
              justify="space-between"
              align="center"
              gap={2}
              onClick={() => {
                toggleDrawer();
                navigate("/profile");
              }}
              sx={{
                cursor: "pointer",
                p: 1.5,
                borderRadius: '16px',
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.06)}`,
                transition: "all 0.2s ease",
                "&:hover": { 
                  transform: "translateY(-3px)",
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  bgcolor: theme.palette.background.paper,
                },
              }}
            >
              <AppFlexLayout gap={2} sx={{ minWidth: 0, flex: 1, pl: 1 }}>
                <AppProfileAvatar
                  profileUrl={user?.avatar}
                  displayName={user?.name}
                  size="medium"
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", opacity: 0.8 }}>
                    {user?.email}
                  </Typography>
                </Box>
              </AppFlexLayout>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDrawer();
                  dispatch(logout());
                }}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.error.main, 0.08),
                  color: theme.palette.error.main,
                  borderRadius : theme.shape.borderRadius ,
                  mr: 0.5,
                  "&:hover": { 
                    bgcolor: theme.palette.error.main,
                    color: "#fff"
                  },
                }}
                icon={<LogOut size={18} />}
              />
            </AppFlexLayout>
          ) : (
            <FilledButton
              component={Link}
              to="/login"
              fullWidth
              onClick={toggleDrawer}
              sx={{ py: 1.5, borderRadius: '16px', fontWeight: 700, fontSize: "1rem" }}
            >
              Join the Discussion
            </FilledButton>
          )}
        </Box>

        {/* Mekanisme "Pintu Kios" (Hanya indikator horizontal, tipis & padat) */}
        <Box
          onClick={toggleDrawer}
          sx={{
            width: "100%",
            py: 1.5, 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            bgcolor: "transparent", 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
            transition: "all 0.3s ease",
            "&:hover": {
              "& .kiosk-handle": {
                width: 64, 
                bgcolor: theme.palette.primary.main,
              },
            },
          }}
        >
          <Box
            className="kiosk-handle"
            sx={{
              width: 40,
              height: 5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.text.secondary, 0.3),
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </Box>
      </AppFlexLayout>
    ),
    [theme, location.pathname, toggleDrawer, isAuthenticated, user, dispatch, navigate, handleToggleTheme]
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          border: "none",
          background: scrolled
            ? alpha(theme.palette.background.default, 0.6)
            : alpha(theme.palette.background.default, 0.8),
          backdropFilter: scrolled ? "blur(12px)" : "none",
          transition: theme.transitions.create("background-color"),
        }}
      >
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{ height: HEIGHT_APPBAR, px: { xs: 1, sm: 2 } }}
          >
            <AppFlexLayout
              justify="space-between"
              align="center"
              sx={{ width: "100%" }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <AppLogo size="medium" />
              </Box>

              {!isMobile && (
                <AppFlexLayout
                  gap={4}
                  sx={{
                    position: "absolute",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {navbarMenu.map((item) => (
                    <TextButton
                      key={item.id}
                      component={Link}
                      to={item.path}
                      size="extraSmall"
                      sx={{
                        color:
                          location.pathname === item.path
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight: location.pathname === item.path ? 600 : 400,
                      }}
                    >
                      {item.label}
                    </TextButton>
                  ))}
                </AppFlexLayout>
              )}

              <AppFlexLayout
                gap={{ xs: 1, sm: 2 }}
                align="center"
                sx={{ flexShrink: 0 }}
              >
                {!isMobile && (
                  <IconButton
                    onClick={handleToggleTheme}
                    size="extraSmall"
                    sx={{ borderRadius: "50%" }}
                    icon={
                      theme.palette.mode === "dark" ? (
                        <Sun size={16} />
                      ) : (
                        <Moon size={16} />
                      )
                    }
                  />
                )}

                {!isMobile ? (
                  isAuthenticated ? (
                    <AppProfileAvatar
                      profileUrl={user?.avatar}
                      displayName={user?.name}
                      onClick={handleOpenPopper}
                      size="small"
                    />
                  ) : (
                    <FilledButton
                      component={Link}
                      to="/login"
                      size="extraSmall"
                    >
                      Join the Discussion
                    </FilledButton>
                  )
                ) : (
                  <IconButton
                    onClick={toggleDrawer}
                    size="extraSmall"
                    sx={{ borderRadius: "50%" }}
                    icon={<Menu size={isSmallScreen ? 20 : 24} />}
                  />
                )}
              </AppFlexLayout>
            </AppFlexLayout>
          </Toolbar>
        </Container>
      </AppBar>

      <AppPopper
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopper}
        placement="bottom-end"
        popperOptions={{ strategy: "fixed" }}
        sx={{
          mt: 1.5,
          minWidth: 260,
          p: 1,
          backgroundColor: theme.palette.background.default,
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        <AppFlexLayout direction="column" align="stretch" gap={1}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600} noWrap>
              {greetingText}, {user?.name || "User"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ROLE[user?.role?.toUpperCase()] || ROLE.USER}
            </Typography>
          </Box>
          <Divider sx={{ borderStyle: "dashed" }} />
          <MenuItem
            onClick={() => {
              navigate("/profile");
              handleClosePopper();
            }}
            sx={{ borderRadius: theme.shape.borderRadius, py: 1.5 }}
          >
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </MenuItem>
          <Divider sx={{ borderStyle: "dashed" }} />
          <MenuItem
            onClick={() => {
              handleClosePopper();
              dispatch(logout());
            }}
            sx={{
              borderRadius: theme.shape.borderRadius,
              color: "error.main",
              py: 1.5,
              mb: 1,
            }}
          >
            <ListItemIcon>
              <LogOut size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </MenuItem>
        </AppFlexLayout>
      </AppPopper>

      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={toggleDrawer}
        slotProps={{
          paper : {
      sx : {
        width: "100%", 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderBottomLeftRadius: 32, 
        borderBottomRightRadius: 32,
        bgcolor: alpha(theme.palette.background.default, 0.95), 
        backdropFilter: "blur(20px) saturate(180%)", 
        backgroundImage: "none",
        boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, 0.15)}`,
      }
          }
        }}
  
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default memo(Header);