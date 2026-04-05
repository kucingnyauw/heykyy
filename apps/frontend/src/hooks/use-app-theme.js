import { useTheme } from "@mui/material/styles";

/**
 * Semantic wrapper untuk theme (tanpa override MUI behavior)
 */
export const useAppTheme = () => {
  const theme = useTheme();

  return {
    isDark: theme.palette.mode === "dark",
    isLight: theme.palette.mode === "light",
  };
};