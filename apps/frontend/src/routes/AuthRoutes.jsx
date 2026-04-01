import { AppLoadable } from "@heykyy/components";
import { lazy } from "react";
import PublicRoutes from "./PublicRoutes";

const Login = AppLoadable(
  lazy(() => import("../view/auth/authentication/Login"))
);

const CallbackAuth = AppLoadable(
  lazy(() => import("../view/auth/authentication/Callback"))
);

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
          <CallbackAuth />
        </PublicRoutes>
      ),
    },
  ],
};

export default AuthRoutes;
