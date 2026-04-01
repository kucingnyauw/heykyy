import { lazy } from "react";
import { AppLoadable } from "@heykyy/components";
import PublicRoutes from "./PublicRoutes";

const Login = AppLoadable(lazy(() => import("../view/auth/authentication/Login")));
const AuthCallback = AppLoadable(lazy(() => import("../view/auth/authentication/Callback")));

/**
 * Defines the routing structure for public authentication pages.
 * These routes are protected by the PublicRoutes guard, ensuring that actively
 * authenticated administrators are redirected away from login or callback flows.
 *
 * @type {import('react-router-dom').RouteObject}
 */
const AuthRoutes = {
  children: [
    {
      path: "login",
      element: (
        <PublicRoutes>
          <Login />
        </PublicRoutes>
      ),
    },
    {
      path: "auth/callback",
      element: (
        <PublicRoutes>
          <AuthCallback />
        </PublicRoutes>
      ),
    },
  ],
};

export default AuthRoutes;