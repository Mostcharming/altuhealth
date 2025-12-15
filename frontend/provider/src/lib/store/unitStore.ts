import { create } from "zustand";

export interface Unit {
  id: string;
  name: string;
  accountType: "admin" | "enrollee" | "provider" | "corporate";
  createdAt?: string;
  updatedAt?: string;
}

type UnitState = {
  units: Unit[];
  setUnits: (items: Unit[]) => void;
  addUnit: (item: Unit) => void;
  updateUnit: (id: string, patch: Partial<Unit>) => void;
  removeUnit: (id: string) => void;
  clear: () => void;
};

export const useUnitStore = create<UnitState>((set) => ({
  units: [],
  setUnits: (items) => set({ units: items }),
  addUnit: (item) => set((state) => ({ units: [item, ...state.units] })),
  updateUnit: (id, patch) =>
    set((state) => ({
      units: state.units.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),
  removeUnit: (id) =>
    set((state) => ({ units: state.units.filter((u) => u.id !== id) })),
  clear: () => set({ units: [] }),
}));
