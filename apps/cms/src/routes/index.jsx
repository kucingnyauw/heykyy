import { createBrowserRouter } from "react-router-dom";
import MainRoutes from "./MainRoutes";
import AuthRoutes from "./AuthRoutes";
import StandAloneRoutes from "./StandAloneRoutes";
import ErrorBoundary from "./ErrorBoundary";

/**
 * The foundational root routing configuration.
 * Incorporates a global error boundary to catch and gracefully handle
 * any routing or rendering failures across the entire application.
 *
 * @type {import('react-router-dom').RouteObject}
 */
const rootRoute = {
  path: "/",
  errorElement: <ErrorBoundary />,
  children: [
    ...(Array.isArray(MainRoutes) ? MainRoutes : [MainRoutes]),
    ...(Array.isArray(AuthRoutes) ? AuthRoutes : [AuthRoutes]),
    ...(Array.isArray(StandAloneRoutes) ? StandAloneRoutes : [StandAloneRoutes]),
  ],
};

/**
 * The primary application router instance.
 * Consolidates the main CMS dashboard routes, public authentication routes, 
 * and standalone utility routes into a single DOM router.
 */
const router = createBrowserRouter([rootRoute]);

export default router;