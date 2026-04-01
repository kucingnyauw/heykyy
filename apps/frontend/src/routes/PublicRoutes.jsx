import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectIsAuthenticated } from "../store/auth/auth-selectors";

const PublicRoutes = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (isAuthenticated) {
    return <Navigate to={"/"} replace />;
  }

  return children;
};

export default PublicRoutes;
