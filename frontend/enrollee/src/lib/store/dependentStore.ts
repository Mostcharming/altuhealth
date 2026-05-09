import { create } from "zustand";

export interface Dependent {
  id: string;
  enrolleeId: string;
  policyNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  relationshipToEnrollee: "spouse" | "child" | "parent" | "sibling" | "other";
  phoneNumber?: string | null;
  email?: string | null;
  occupation?: string | null;
  maritalStatus?:
    | "single"
    | "married"
    | "divorced"
    | "widowed"
    | "separated"
    | null;
  pictureUrl?: string | null;
  idCardUrl?: string | null;
  preexistingMedicalRecords?: string | null;
  isVerified?: boolean;
  verifiedAt?: string | null;
  enrollmentDate?: string;
  expirationDate?: string | null;
  isActive?: boolean;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type DependentState = {
  dependents: Dependent[];
  setDependents: (items: Dependent[]) => void;
  addDependent: (item: Dependent) => void;
  updateDependent: (id: string, patch: Partial<Dependent>) => void;
  removeDependent: (id: string) => void;
  clear: () => void;
};

export const useDependentStore = create<DependentState>((set) => ({
  dependents: [],
  setDependents: (items: Dependent[]) => set({ dependents: items }),
  addDependent: (item: Dependent) =>
    set((state) => ({ dependents: [...state.dependents, item] })),
  updateDependent: (id: string, patch: Partial<Dependent>) =>
    set((state) => ({
      dependents: state.dependents.map((dep) =>
        dep.id === id ? { ...dep, ...patch } : dep
      ),
    })),
  removeDependent: (id: string) =>
    set((state) => ({
      dependents: state.dependents.filter((dep) => dep.id !== id),
    })),
  clear: () => set({ dependents: [] }),
}));
