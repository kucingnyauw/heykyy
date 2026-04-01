import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { RouterProvider } from "react-router-dom";

import router from "./routes";
import { getTheme } from "./Theme";
import { getCurrentUser } from "./store/auth/auth-thunk";
import { getThemeMode } from "./store/theme/theme-selectors";

/**
 * Root application component.
 *
 * Responsibilities:
 * - Initialize authenticated user state
 * - Provide MUI theme based on global mode (light/dark)
 * - Sync DOM attributes with current theme
 * - Mount application router
 *
 * @component
 * @returns {JSX.Element}
 */
function App() {
  const dispatch = useDispatch();

  const mode = useSelector(getThemeMode);

  /**
   * Memoized MUI theme instance.
   * Prevents unnecessary re-creation on each render.
   *
   * @type {import("@mui/material").Theme}
   */
  const theme = useMemo(() => getTheme(mode), [mode]);

  /**
   * Fetch current authenticated user on initial mount.
   * This ensures persisted session (e.g., token) is validated.
   */
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  /**
   * Synchronize:
   * - <meta name="theme-color"> for browser UI (mobile address bar, etc.)
   * - <html data-theme="..."> for CSS-based theming
   *
   * Triggered whenever theme mode or background color changes.
   */
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.setAttribute("content", theme.palette.background.default);
    }

    document.documentElement.setAttribute("data-theme", mode);
  }, [mode, theme.palette.background.default]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;