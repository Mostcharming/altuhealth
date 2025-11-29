import { create } from "zustand";

export interface Provider {
  id: string;
  name: string;
  code: string;
  email: string;
}

export interface Drug {
  id: string;
  name: string;
  unit: string;
  description?: string | null;
  strength?: string | null;
  price: number;
  status: "active" | "inactive" | "pending";
  isDeleted?: boolean;
  providerId: string;
  provider?: Provider;
  createdAt?: string;
  updatedAt?: string;
}

type DrugState = {
  drugs: Drug[];
  setDrugs: (items: Drug[]) => void;
  addDrug: (item: Drug) => void;
  updateDrug: (id: string, patch: Partial<Drug>) => void;
  removeDrug: (id: string) => void;
  clear: () => void;
};

export const useDrugStore = create<DrugState>((set) => ({
  drugs: [],
  setDrugs: (items) => set({ drugs: items }),
  addDrug: (item) => set((state) => ({ drugs: [item, ...state.drugs] })),
  updateDrug: (id, patch) =>
    set((state) => ({
      drugs: state.drugs.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })),
  removeDrug: (id) =>
    set((state) => ({ drugs: state.drugs.filter((d) => d.id !== id) })),
  clear: () => set({ drugs: [] }),
}));
