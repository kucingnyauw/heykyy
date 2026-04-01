import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: true,
  collapsed: false,
  mobileOpen: false,
  activeKey: null,
};

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.open = !state.open;
    },

    openSidebar(state) {
      state.open = true;
    },

    closeSidebar(state) {
      state.open = false;
    },

    toggleCollapsed(state) {
      state.collapsed = !state.collapsed;
    },

    setCollapsed(state, action) {
      state.collapsed = action.payload;
    },

    toggleMobile(state) {
      state.mobileOpen = !state.mobileOpen;
    },

    closeMobile(state) {
      state.mobileOpen = false;
    },

    setActiveKey(state, action) {
      state.activeKey = action.payload;
    },

    resetSidebar() {
      return initialState;
    },
  },
});

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleCollapsed,
  setCollapsed,
  toggleMobile,
  closeMobile,
  setActiveKey,
  resetSidebar,
} = sidebarSlice.actions;

export default sidebarSlice.reducer;
