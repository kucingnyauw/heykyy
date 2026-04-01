import React, { memo } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  selectAuthUser,
  selectIsAuthenticated,
} from "../store/auth/auth-selectors";

/**
 * A higher-order routing component that restricts authenticated administrators
 * from accessing public-facing routes (e.g., authentication or login pages).
 * If an active admin session is detected, it automatically redirects them to the main dashboard.
 *
 * @param {Object} props - The component properties.
 * @param {React.ReactNode} props.children - The public child components to render.
 * @returns {JSX.Element} The public content or a redirection component.
 */
const PublicRoutes = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectAuthUser);

  if (isAuthenticated && user?.role === "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default memo(PublicRoutes);