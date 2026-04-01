import { lazy } from "react";
import { AppLoadable } from "@heykyy/components";
import MinimalLayout from "../layout/MinimalLayout";
import PrivateRoutes from "./PrivateRoutes";

const BlogPostForm = AppLoadable(lazy(() => import("../view/blogs/BlogsPost")));
const ProjectPostForm = AppLoadable(lazy(() => import("../view/projects/ProjectsPost")));
const Profile = AppLoadable(lazy(() => import("../view/user/Profile")));

/**
 * Defines standalone routes for the authenticated CMS.
 * These routes utilize a MinimalLayout, which is ideal for distraction-free
 * interfaces such as full-screen content editors or profile settings.
 * Paths are structured hierarchically according to their resource domain.
 *
 * @type {import('react-router-dom').RouteObject}
 */
const StandAloneRoutes = {
  path: "",
  element: (
    <PrivateRoutes>
      <MinimalLayout />
    </PrivateRoutes>
  ),
  children: [
    {
      path: "blogs/editor/:slug?/:mode",
      element: <BlogPostForm />,
    },
    {
      path: "projects/editor/:slug?/:mode",
      element: <ProjectPostForm />,
    },
    {
      path: "profile",
      element: <Profile />,
    },
  
  ],
};

export default StandAloneRoutes;