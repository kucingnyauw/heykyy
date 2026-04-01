import { Outlet } from "react-router-dom";
import { useTheme, useMediaQuery, Box } from "@mui/material";
import { useSelector } from "react-redux";
import Sidebar from "./sidebar/Sidebar";
import MainContentStyled from "./MainContentStyled";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { selectSidebarCollapsed } from "../store/sidebar/sidebar-selector";

const MainLayout = () => {
  const theme = useTheme();
  const matchDownMd = useMediaQuery(theme.breakpoints.down("md"));
  const isCollapsed = useSelector(selectSidebarCollapsed);

  return (
    <>
      <Header />
      <Sidebar />

      <MainContentStyled open={!matchDownMd && !isCollapsed}>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <Outlet />
        </Box>

        <Footer />
      </MainContentStyled>
    </>
  );
};

export default MainLayout;
