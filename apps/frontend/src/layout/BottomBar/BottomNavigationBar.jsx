import React, { useEffect, useRef, memo } from "react";
import { BottomNavigation, BottomNavigationAction, alpha, useTheme, Box } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { navbarMenu } from "../../menu-items";

const MotionNav = motion(BottomNavigation);

/**
 * Komponen Bottom App Bar untuk navigasi utama pada perangkat mobile dan tablet.
 * Dilengkapi dengan animasi scroll-to-hide dan disembunyikan secara otomatis pada layar desktop.
 *
 * @returns {JSX.Element}
 */
const BottomAppBar = () => {
  const theme = useTheme();
  const location = useLocation();
  const controls = useAnimation();
  
  const lastScrollY = useRef(0);
  const isHidden = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (Math.abs(currentScrollY - lastScrollY.current) < 10) return;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        if (!isHidden.current) {
          controls.start({ y: 100, opacity: 0 });
          isHidden.current = true;
        }
      } else {
        if (isHidden.current) {
          controls.start({ y: 0, opacity: 1 });
          isHidden.current = false;
        }
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 16, sm: 24 },
        left: 0,
        right: 0,
        display: { xs: "flex", md: "none" },
        justifyContent: "center",
        zIndex: theme.zIndex.appBar,
        pointerEvents: "none",
        px: 2,
      }}
    >
      <MotionNav
        initial={{ y: 0, opacity: 1 }}
        animate={controls}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        showLabels={false}
        sx={{
          pointerEvents: "auto",
          width: "100%",
          maxWidth: { xs: "100%", sm: 400 },
          height: { xs: 56, sm: 64 },
          px: { xs: 1, sm: 1.5 },
          gap: 1,
          borderRadius: "32px",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.85),
          backdropFilter: "blur(16px)",
          boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.3 : 0.1)}`,
        }}
      >
        {navbarMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <BottomNavigationAction
              key={item.id}
              component={Link}
              to={item.path}
              disableRipple
              icon={
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative",
                  }}
                >
                  <Icon 
                    size={22} 
                    color={isActive ? theme.palette.primary.main : theme.palette.text.secondary}
                  />
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        backgroundColor: theme.palette.primary.main,
                        position: "absolute",
                        bottom: -12,
                      }}
                    />
                  )}
                </Box>
              }
              sx={{
                minWidth: { xs: 48, sm: 56 },
                borderRadius: "24px",
                padding: "8px",
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                "& .MuiBottomNavigationAction-label": {
                  display: "none",
                },
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.text.primary, 0.04),
                },
                "&:active": {
                  transform: "scale(0.92)",
                },
              }}
            />
          );
        })}
      </MotionNav>
    </Box>
  );
};

export default memo(BottomAppBar);