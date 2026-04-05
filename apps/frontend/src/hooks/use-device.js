import { useTheme, useMediaQuery } from "@mui/material";

/**
 * Hook untuk mendeteksi breakpoint device berbasis theme MUI.
 *
 * @returns {{
 *  isMobile: boolean,
 *  isTablet: boolean,
 *  isDesktop: boolean
 * }}
 */
export const useDevice = () => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  return {
    isMobile,
    isTablet,
    isDesktop,
  };
};
