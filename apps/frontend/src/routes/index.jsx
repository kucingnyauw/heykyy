// src/router/router.jsx
import { createBrowserRouter } from "react-router-dom";
import MainRoutes from "./MainRoutes";
import AuthRoutes from "./AuthRoutes";
import SinglePageRoutes from "./SinglePageRoutes";
import ErrorBoundary from "./ErrorBoundary";

// Root route dengan ErrorBoundary
const rootRoute = {
  path: "/",
  errorElement: <ErrorBoundary />, // ⬅️ pasang di sini

  children: [
    ...(Array.isArray(MainRoutes) ? MainRoutes : [MainRoutes]),
    ...(Array.isArray(AuthRoutes) ? AuthRoutes : [AuthRoutes]),
    ...(Array.isArray(SinglePageRoutes) ? SinglePageRoutes : [SinglePageRoutes]),
  ],
};

const router = createBrowserRouter([rootRoute]);

export default router;