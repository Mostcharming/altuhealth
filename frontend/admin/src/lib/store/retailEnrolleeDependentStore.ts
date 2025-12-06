import { create } from "zustand";

export interface RetailEnrolleeDependent {
  id: string;
  retailEnrolleeId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber?: string | null;
  email?: string | null;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  relationship: "spouse" | "child" | "parent" | "sibling" | "other";
  state?: string | null;
  lga?: string | null;
  country?: string | null;
  address?: string | null;
  pictureUrl?: string | null;
  idCardUrl?: string | null;
  isActive: boolean;
  RetailEnrollee?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

type RetailEnrolleeDependentState = {
  dependents: RetailEnrolleeDependent[];
  setDependents: (items: RetailEnrolleeDependent[]) => void;
  addDependent: (item: RetailEnrolleeDependent) => void;
  updateDependent: (
    id: string,
    patch: Partial<RetailEnrolleeDependent>
  ) => void;
  removeDependent: (id: string) => void;
  clear: () => void;
};

export const useRetailEnrolleeDependentStore =
  create<RetailEnrolleeDependentState>((set) => ({
    dependents: [],
    setDependents: (items) => set({ dependents: items }),
    addDependent: (item) =>
      set((state) => ({ dependents: [item, ...state.dependents] })),
    updateDependent: (id, patch) =>
      set((state) => ({
        dependents: state.dependents.map((d) =>
          d.id === id ? { ...d, ...patch } : d
        ),
      })),
    removeDependent: (id) =>
      set((state) => ({
        dependents: state.dependents.filter((d) => d.id !== id),
      })),
    clear: () => set({ dependents: [] }),
  }));
