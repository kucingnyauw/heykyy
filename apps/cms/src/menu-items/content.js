import icons from "./icons";

/**
 * Admin Content Menu (2 Level)
 */
const content = [
  {
    id: "admin-content",
    title: "Content Management",
    type: "group",
    children: [
      {
        id: "blogs",
        title: "Blogs",
        type: "item",
        url: "/blogs",
        icon: icons.Blog,
      },
      {
        id: "projects",
        title: "Projects",
        type: "item",
        url: "/projects",
        icon: icons.Project,
      },
      {
        id: "certificates",
        title: "Certificates",
        type: "item",
        url: "/certificates",
        icon: icons.Certificate,
      },
      {
        id: "categories",
        title: "Categories",
        type: "item",
        url: "/categories",
        icon: icons.Category,
      },
      {
        id: "technologies",
        title: "Tech / Stacks",
        type: "item",
        url: "/technologies",
        icon: icons.Tech,
      },
      {
        id: "comments",
        title: "Comments",
        type: "item",
        url: "/comments",
        icon: icons.Comment,
      },
      {
        id: "cvs",
        title: "CVs",
        type: "item",
        url: "/cvs",
        icon: icons.CV,
      },
      {
        id: "educations",
        title: "Education",
        type: "item",
        url: "/educations",
        icon: icons.Education,
      },
    ],
  },
];

export default content;