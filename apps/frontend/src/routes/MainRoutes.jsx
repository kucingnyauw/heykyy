import MainLayout from "../layout/MainLayout";
import { AppLoadable } from "@heykyy/components";
import { lazy } from "react";

const Homepage = AppLoadable(lazy(() => import("../view/home/Home")));

const About = AppLoadable(lazy(() => import("../view/about/About")));

const Project = AppLoadable(lazy(() => import("../view/projects/Project")));

const Blogs = AppLoadable(lazy(() => import("../view/blogs/Blogs")));

/**
 * Configuration object for main application routes.
 * Defines the routing structure for the primary navigation pages.
 * @type {Object}
 */
const MainRoutes = {
  path: "/",
  element: <MainLayout />,
  children: [
    { 
      index: true, 
      element: <Homepage /> 
    },
    { 
      path: "about", 
      element: <About /> 
    },
    { 
      path: "project", 
      element: <Project /> 
    },
    { 
      path: "blog", 
      element: <Blogs /> 
    },
  ],
};

export default MainRoutes;