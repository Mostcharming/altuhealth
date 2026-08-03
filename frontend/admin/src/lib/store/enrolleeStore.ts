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
  country?: string | null;
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
  enrollmentDate?: string | null;
  expirationDate?: string | null;
  pictureUrl?: string | null;
  idCardUrl?: string | null;
  isActive: boolean;
  isVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  Company?: {
    id: string;
    name: string;
  };
  companyPlan?: {
    id: string;
    name: string;
    planType?: string;
    planCycle?: string;
    annualPremiumPrice?: number;
    currency?: string;
  };
  Staff?: {
    id: string;
    staffId?: string | null;
    subscriptionId?: string | null;
    Subscription?: {
      id: string;
      code: string;
      startDate: string;
      endDate: string;
      status: "active" | "suspended" | "inactive" | "expired";
    } | null;
  };
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
