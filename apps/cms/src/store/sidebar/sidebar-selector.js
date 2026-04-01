export const selectSidebar = (state) => state.sidebar;

export const selectSidebarOpen = (state) => state.sidebar.open;

export const selectSidebarCollapsed = (state) =>
  state.sidebar.collapsed;

export const selectSidebarMobileOpen = (state) =>
  state.sidebar.mobileOpen;

export const selectSidebarActiveKey = (state) =>
  state.sidebar.activeKey;
