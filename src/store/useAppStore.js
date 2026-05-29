import { create } from "zustand";

export const useAppStore = create((set) => ({
  sidebarCollapsed:      false,
  activeAccountId:       null,
  notificationPanelOpen: false,
  notificationFilter:    "all",

  setSidebarCollapsed:      (v) => set({ sidebarCollapsed: v }),
  setActiveAccountId:       (v) => set({ activeAccountId: v }),
  setNotificationPanelOpen: (v) => set({ notificationPanelOpen: v }),
  setNotificationFilter:    (v) => set({ notificationFilter: v }),
}));
