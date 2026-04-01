import { AppLoadable } from "@heykyy/components";
import { lazy } from "react";
import SingleLayout from "../layout/SingleLayout";
import PrivateRoutes from "./PrivateRoutes";

const BlogsDetails = AppLoadable(
  lazy(() => import("../view/blogs/BlogsDetails"))
);

const ProjectDetails = AppLoadable(
  lazy(() => import("../view/projects/ProjectDetails"))
);

const Profile = AppLoadable(lazy(() => import("../view/Profile")));

const Guidelines = AppLoadable(
  lazy(() => import("../view/guidelines/Guidelines"))
);

const Privacy = AppLoadable(lazy(() => import("../view/privacy/Privacy")));

const Terms = AppLoadable(lazy(() => import("../view/terms/Terms")));

/**
 * Configuration object for single page routes.
 * Defines the routing structure for dynamic details and static legal pages.
 * @type {Object}
 */
const SinglePageRoutes = {
  path: "/",
  element: <SingleLayout />,
  children: [
    {
      path: "blog/:slug",
      element: <BlogsDetails />,
    },
    {
      path: "project/:slug",
      element: <ProjectDetails />,
    },
    {
      path: "profile",
      element: (
        <PrivateRoutes>
          <Profile />
        </PrivateRoutes>
      ),
    },
    {
      path: "guidelines",
      element: <Guidelines />,
    },
    {
      path: "privacy",
      element: <Privacy />,
    },
    {
      path: "terms",
      element: <Terms />,
    },
  ],
};

export default SinglePageRoutes;
