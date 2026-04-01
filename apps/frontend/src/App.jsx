import React, { useEffect, useMemo } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { getTheme } from "./Theme";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { useSelector, useDispatch } from "react-redux";
import { getThemeMode } from "./store/theme/theme-selectors";
import { getCurrentUser } from "./store/auth/auth-thunk";
import NavigationScroll from "./layout/NavigationScroll";

const App = () => {
  const dispatch = useDispatch();
  const mode = useSelector(getThemeMode);

  const theme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  /**
   * Synchronize theme-color meta and HTML data-theme with current MUI theme
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
      <NavigationScroll>
        <RouterProvider router={router} />
      </NavigationScroll>
    </ThemeProvider>
  );
};

export default App;
