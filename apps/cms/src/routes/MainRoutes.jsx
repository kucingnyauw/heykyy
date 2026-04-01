import { lazy } from "react";
import { AppLoadable } from "@heykyy/components";
import MainLayout from "../layout/MainLayout";
import PrivateRoutes from "./PrivateRoutes";

const Dashboard = AppLoadable(
  lazy(() => import("../view/dashboard/Dashboard"))
);
const Blogs = AppLoadable(lazy(() => import("../view/blogs/Blogs")));
const Projects = AppLoadable(lazy(() => import("../view/projects/Projects")));
const Certificates = AppLoadable(
  lazy(() => import("../view/certificates/Certificates"))
);
const Categories = AppLoadable(
  lazy(() => import("../view/categories/Categories"))
);
const Technologies = AppLoadable(
  lazy(() => import("../view/technologies/Technologies"))
);
const Comments = AppLoadable(lazy(() => import("../view/comments/Comments")));
const Cvs = AppLoadable(lazy(() => import("../view/cvs/Cvs")));
const Educations = AppLoadable(
  lazy(() => import("../view/educations/Educations"))
);

/**
 * Defines the main routing structure for the authenticated CMS dashboard.
 * Wraps all child routes within the PrivateRoutes guard and MainLayout wrapper.
 * Component names, imports, and URL paths follow strict RESTful pluralization conventions.
 *
 * @type {import('react-router-dom').RouteObject}
 */
const MainRoutes = {
  path: "/",
  element: (
    <PrivateRoutes>
      <MainLayout />
    </PrivateRoutes>
  ),
  children: [
    { index: true, element: <Dashboard /> },
    { path: "dashboard", element: <Dashboard /> },
    { path: "blogs", element: <Blogs /> },
    { path: "projects", element: <Projects /> },
    { path: "certificates", element: <Certificates /> },
    { path: "categories", element: <Categories /> },
    { path: "technologies", element: <Technologies /> },
    { path: "comments", element: <Comments /> },
    { path: "cvs", element: <Cvs /> },
    { path: "educations", element: <Educations /> },
  ],
};

export default MainRoutes;
