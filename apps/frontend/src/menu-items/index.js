import {
  Home,
  User,
  LayoutGrid,
  BookOpen,
} from "lucide-react";

export const navbarMenu = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    path: "/",
  },
  {
    id: "about",
    label: "About",
    icon: User,
    path: "/about",
  },
  {
    id: "project",
    label: "Project",
    icon: LayoutGrid,
    path: "/project",
  },
  {
    id: "blog",
    label: "Blog",
    icon: BookOpen,
    path: "/blog",
  },
];