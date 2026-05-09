import { create } from "zustand";

export interface EnrolleeDependent {
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
  isVerified: boolean;
  verificationCode?: string | null;
  verificationCodeExpiresAt?: string | null;
  verifiedAt?: string | null;
  verificationAttempts: number;
  enrollmentDate: string;
  expirationDate?: string | null;
  isActive: boolean;
  notes?: string | null;
  Enrollee?: {
    id: string;
    firstName: string;
    lastName: string;
    policyNumber: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

type EnrolleeDependentState = {
  dependents: EnrolleeDependent[];
  setDependents: (items: EnrolleeDependent[]) => void;
  addDependent: (item: EnrolleeDependent) => void;
  updateDependent: (id: string, patch: Partial<EnrolleeDependent>) => void;
  removeDependent: (id: string) => void;
  clear: () => void;
};

export const useEnrolleeDependentStore = create<EnrolleeDependentState>(
  (set) => ({
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
  })
);
