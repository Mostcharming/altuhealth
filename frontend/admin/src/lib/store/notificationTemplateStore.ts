import { create } from "zustand";

export interface NotificationTemplate {
  id: string;
  name: string;
  subject?: string;
  body?: string;
  type?: "email" | "sms" | "push";
  status?: "active" | "inactive";
  act?: string;
  emailBody?: string;
  smsBody?: string;
  emailStatus?: boolean;
  smsStatus?: boolean;
  shortcodes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

type NotificationTemplateState = {
  templates: NotificationTemplate[];
  currentTemplate: NotificationTemplate | null;
  setTemplates: (items: NotificationTemplate[]) => void;
  addTemplate: (item: NotificationTemplate) => void;
  updateTemplate: (id: string, patch: Partial<NotificationTemplate>) => void;
  removeTemplate: (id: string) => void;
  setCurrentTemplate: (template: NotificationTemplate | null) => void;
  clear: () => void;
};

export const useNotificationTemplateStore = create<NotificationTemplateState>(
  (set) => ({
    templates: [],
    currentTemplate: null,
    setTemplates: (items) => set({ templates: items }),
    addTemplate: (item) =>
      set((state) => ({ templates: [item, ...state.templates] })),
    updateTemplate: (id, patch) =>
      set((state) => ({
        templates: state.templates.map((t) =>
          t.id === id ? { ...t, ...patch } : t
        ),
      })),
    removeTemplate: (id) =>
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      })),
    setCurrentTemplate: (template) => set({ currentTemplate: template }),
    clear: () => set({ templates: [], currentTemplate: null }),
  })
);
