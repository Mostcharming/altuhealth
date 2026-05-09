import { create } from "zustand";

export interface Enrollee {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  policyNumber: string;
  staffId: string;
  companyId: string;
  companyPlanId: string;
  dateOfBirth: string;
  state?: string | null;
  lga?: string | null;
  address?: string | null;
  occupation?: string | null;
  maritalStatus?: string | null;
  gender: string;
  phoneNumber: string;
  email: string;
  maxDependents?: number | null;
  preexistingMedicalRecords?: string | null;
  expirationDate?: string | null;
  pictureUrl?: string | null;
  idCardUrl?: string | null;
  isActive: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type EnrolleeState = {
  enrollees: Enrollee[];
  setEnrollees: (items: Enrollee[]) => void;
  addEnrollee: (item: Enrollee) => void;
  updateEnrollee: (id: string, patch: Partial<Enrollee>) => void;
  removeEnrollee: (id: string) => void;
  clear: () => void;
};

export const useEnrolleeStore = create<EnrolleeState>((set) => ({
  enrollees: [],
  setEnrollees: (items) => set({ enrollees: items }),
  addEnrollee: (item) =>
    set((state) => ({ enrollees: [item, ...state.enrollees] })),
  updateEnrollee: (id, patch) =>
    set((state) => ({
      enrollees: state.enrollees.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    })),
  removeEnrollee: (id) =>
    set((state) => ({ enrollees: state.enrollees.filter((e) => e.id !== id) })),
  clear: () => set({ enrollees: [] }),
}));
