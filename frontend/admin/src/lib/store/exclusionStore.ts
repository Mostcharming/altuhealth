import { create } from "zustand";

export interface Exclusion {
  id: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

type ExclusionState = {
  exclusions: Exclusion[];
  setExclusions: (items: Exclusion[]) => void;
  addExclusion: (item: Exclusion) => void;
  updateExclusion: (id: string, patch: Partial<Exclusion>) => void;
  removeExclusion: (id: string) => void;
  clear: () => void;
};

export const useExclusionStore = create<ExclusionState>((set) => ({
  exclusions: [],
  setExclusions: (items) => set({ exclusions: items }),
  addExclusion: (item) =>
    set((state) => ({ exclusions: [item, ...state.exclusions] })),
  updateExclusion: (id, patch) =>
    set((state) => ({
      exclusions: state.exclusions.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    })),
  removeExclusion: (id) =>
    set((state) => ({
      exclusions: state.exclusions.filter((e) => e.id !== id),
    })),
  clear: () => set({ exclusions: [] }),
}));
