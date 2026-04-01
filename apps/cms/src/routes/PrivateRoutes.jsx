import React, { useEffect, memo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
  selectAuthUser,
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsInitialized
} from "../store/auth/auth-selectors";
import { AppLoading } from "@heykyy/components";
import { logout } from "../store/auth/auth-thunk";

/**
 * A higher-order routing component that strictly restricts access to authenticated administrators.
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The protected child components.
 * @returns {JSX.Element}
 */
const PrivateRoutes = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();

  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);
  const status = useSelector(selectAuthStatus);
  const isInitialized = useSelector(selectIsInitialized);

  useEffect(() => {
    if (isAuthenticated && user?.role !== "ADMIN") {
      dispatch(logout());
    }
  }, [isAuthenticated, user, dispatch]);

  if (!isInitialized || status === "loading") {
    return <AppLoading />;
  }

  if (!isAuthenticated || user?.role !== "ADMIN") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default memo(PrivateRoutes);