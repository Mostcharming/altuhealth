import { create } from "zustand";

export interface NotificationLog {
  id: string;
  userId: string;
  userType: string;
  sentTo: string;
  subject?: string;
  message?: string;
  notificationType: string;
  createdAt?: string;
  updatedAt?: string;
}

type NotificationLogState = {
  notificationLogs: NotificationLog[];
  setNotificationLogs: (items: NotificationLog[]) => void;
  addNotificationLog: (item: NotificationLog) => void;
  removeNotificationLog: (id: string) => void;
  clear: () => void;
};

export const useNotificationLogStore = create<NotificationLogState>((set) => ({
  notificationLogs: [],
  setNotificationLogs: (items) => set({ notificationLogs: items }),
  addNotificationLog: (item) =>
    set((state) => ({ notificationLogs: [item, ...state.notificationLogs] })),
  removeNotificationLog: (id) =>
    set((state) => ({
      notificationLogs: state.notificationLogs.filter((log) => log.id !== id),
    })),
  clear: () => set({ notificationLogs: [] }),
}));
