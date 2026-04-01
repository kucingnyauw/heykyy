import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import MinimalLayoutStyled from "./MinimalLayoutStyled";

const MinimalLayout = () => {
  return (
    <>

      <MinimalLayoutStyled>
      <Outlet />
      </MinimalLayoutStyled>
    </>
  );
};

export default MinimalLayout;
