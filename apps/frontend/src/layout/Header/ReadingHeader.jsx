/**
 * @fileoverview Minimalist header component designed specifically for reading views.
 * Provides a distraction-free navigation bar with a responsive back button and a theme toggle.
 */

import { HEIGHT_APPBAR } from "@heykyy/constant";
import { AppBar, Toolbar, alpha, useTheme } from "@mui/material";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IconButton, AppFlexLayout } from "@heykyy/components";
import { useSelector, useDispatch } from "react-redux";
import { getThemeMode } from "../../store/theme/theme-selectors";
import { toggleTheme } from "../../store/theme/theme-slice";

/**
 * Renders a sticky, transparent App Bar tailored for reading environments.
 * * UI Logic:
 * - Employs a transparent background with slight opacity to blend with the reading content.
 * - Displays a "Back" button exclusively on mobile screens (`xs` to `sm`) to facilitate easy navigation, 
 * hiding it on desktop (`md` and up) where browser navigation or a persistent sidebar might be preferred.
 * - Uses `AppFlexLayout` with `ml: "auto"` to ensure the theme toggle button is consistently pushed to the right edge.
 *
 * @returns {JSX.Element} The rendered reading header layout.
 */
const ReadingHeader = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const mode = useSelector(getThemeMode);
  const dispatch = useDispatch();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        border: "none",
        backgroundColor: alpha(theme.palette.background.default, 0.1),
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: HEIGHT_APPBAR,
          px: theme.spacing(3),
        }}
      >
        <AppFlexLayout
          align="center"
          sx={{ width: "100%" }}
        >
          {/* Back — mobile only */}
          <IconButton
            title="Back"
            sx={{
              borderRadius: "50%",
              display: { xs: "inline-flex", md: "none" },
            }}
            onClick={() => navigate(-1)}
            icon={<ArrowLeft size={20} />}
          />

          {/* Spacer pushes toggle to right */}
          <AppFlexLayout sx={{ ml: "auto" }}>
            <IconButton
              title="Toggle Mode"
              sx={{ borderRadius: "50%" }}
              onClick={() => dispatch(toggleTheme())}
              size="medium" // FIXED: dari 'md' ke 'medium'
              icon={mode === "dark" ? <Sun size={20} /> : <Moon size={18} />}
            />
          </AppFlexLayout>
        </AppFlexLayout>
      </Toolbar>
    </AppBar>
  );
};

export default ReadingHeader;