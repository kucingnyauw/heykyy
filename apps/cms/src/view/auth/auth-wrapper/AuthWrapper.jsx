// AuthWrapper.jsx
import { styled } from "@mui/material/styles";

const AuthWrapper = styled("div")(({ theme }) => ({
  position: "relative",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: theme.palette.background.paper ,
  overflow: "hidden",


}));

export default AuthWrapper;
