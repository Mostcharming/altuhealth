import { create } from "zustand";

export interface GeneralSettings {
  id?: string;
  emailFrom?: string;
  smsFrom?: string;
  emailTemplate?: string;
  smsBody?: string;
  emailNotification?: boolean;
  smsNotification?: boolean;
  mailConfig?: Record<string, unknown>;
  smsConfig?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

type GeneralSettingsState = {
  settings: GeneralSettings | null;
  setSettings: (settings: GeneralSettings | null) => void;
  updateSettings: (patch: Partial<GeneralSettings>) => void;
  clear: () => void;
};

export const useGeneralSettingsStore = create<GeneralSettingsState>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),
  updateSettings: (patch) =>
    set((state) => ({
      settings: state.settings ? { ...state.settings, ...patch } : null,
    })),
  clear: () => set({ settings: null }),
}));
