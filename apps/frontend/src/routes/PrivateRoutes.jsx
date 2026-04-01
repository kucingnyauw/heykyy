import React, { memo } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import {
  selectAuthStatus,
  selectIsAuthenticated,
  selectIsInitialized,
} from "../store/auth/auth-selectors";
import { AppLoading } from "@heykyy/components";

/**
 * A higher-order routing component that restricts access to authenticated users without role checking.
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The protected child components.
 * @returns {JSX.Element}
 */
const PrivateRoutes = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const status = useSelector(selectAuthStatus);
  const isInitialized = useSelector(selectIsInitialized);

  if (!isInitialized || status === "loading") {
    return <AppLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default memo(PrivateRoutes);