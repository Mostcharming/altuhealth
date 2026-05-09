import { create } from "zustand";

export interface Notification {
  id: string;
  title?: string;
  body?: string;
  source?: string;
  picture?: string;
  isRead?: boolean;
  clickUrl?: string;
  userId?: string | null;
  updatedAt?: string;
  createdAt?: string;
}

type NotificationState = {
  notifications: Notification[];
  setNotifications: (items: Notification[]) => void;
  clear: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (items) => set({ notifications: items }),
  clear: () => set({ notifications: [] }),
}));
