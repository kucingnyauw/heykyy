import icons from "./icons";

const dashboard = [
  {
    id: "dashboard",
    title: "Dashboard",
    type: "group",
    children: [
      {
        id: "default",
        title: "Dashboard",
        type: "item",
        url: "/dashboard",
        icon: icons.Dashboard,
        breadcrumbs: false,
      },
    ],
  },
];

export default dashboard;
