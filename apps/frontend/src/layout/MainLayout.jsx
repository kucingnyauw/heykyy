import { Outlet } from "react-router-dom";
import MainContentStyled from "./MinimalContentStyled";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Fab from "./Fab/Fab";
import BottomAppBar from "./BottomBar/BottomNavigationBar";
import { Box, useMediaQuery, useTheme } from "@mui/material";

/**
 * Komponen Layout Utama (MainLayout).
 * Menyediakan struktur dasar aplikasi yang terdiri dari Header, Konten Utama, dan Footer.
 * Menggunakan hook 'useMediaQuery' untuk menampilkan Bottom Navigation Bar khusus pada perangkat mobile.
 * * @returns {JSX.Element} Struktur fragmen React yang membungkus komponen navigasi dan area outlet.
 */
const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Header />
      <MainContentStyled>
        <Outlet />
        <Fab />
      </MainContentStyled>
      <Footer />
      {isMobile && <BottomAppBar />}
    </>
  );
};

export default MainLayout;