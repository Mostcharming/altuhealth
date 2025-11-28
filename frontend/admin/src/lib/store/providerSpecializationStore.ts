import { create } from "zustand";

export interface ProviderSpecialization {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type ProviderSpecializationState = {
  providerSpecializations: ProviderSpecialization[];
  setProviderSpecializations: (items: ProviderSpecialization[]) => void;
  addProviderSpecialization: (item: ProviderSpecialization) => void;
  updateProviderSpecialization: (
    id: string,
    patch: Partial<ProviderSpecialization>
  ) => void;
  removeProviderSpecialization: (id: string) => void;
  clear: () => void;
};

export const useProviderSpecializationStore =
  create<ProviderSpecializationState>((set) => ({
    providerSpecializations: [],
    setProviderSpecializations: (items) =>
      set({ providerSpecializations: items }),
    addProviderSpecialization: (item) =>
      set((state) => ({
        providerSpecializations: [item, ...state.providerSpecializations],
      })),
    updateProviderSpecialization: (id, patch) =>
      set((state) => ({
        providerSpecializations: state.providerSpecializations.map((p) =>
          p.id === id ? { ...p, ...patch } : p
        ),
      })),
    removeProviderSpecialization: (id) =>
      set((state) => ({
        providerSpecializations: state.providerSpecializations.filter(
          (p) => p.id !== id
        ),
      })),
    clear: () => set({ providerSpecializations: [] }),
  }));
