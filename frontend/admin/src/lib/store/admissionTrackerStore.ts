import { create } from "zustand";

export interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  policyNumber?: string;
}

export interface Provider {
  id: string;
  name: string;
  code?: string;
  category?: string;
  status?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  lga?: string;
  address?: string;
}

export interface Company {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface CompanySubsidiary {
  id: string;
  name: string;
}

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface AdmissionTracker {
  id: string;
  enrolleeId: string;
  providerId: string;
  companyId: string;
  subsidiaryId?: string | null;
  admissionDate: string;
  dischargeDate?: string | null;
  daysOfAdmission?: number | null;
  diagnosis?: string | null;
  diagnosisCode?: string | null;
  roomType?: string | null;
  bedNumber?: string | null;
  ward?: string | null;
  reasonForAdmission?: string | null;
  treatmentNotes?: string | null;
  dischargeNotes?: string | null;
  admittingPhysician?: string | null;
  dischargingPhysician?: string | null;
  status: "admitted" | "discharged" | "transferred" | "absconded" | "expired";
  totalBillAmount?: number | null;
  approvedAmount?: number | null;
  approvedBy?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Enrollee?: Enrollee;
  Provider?: Provider;
  Company?: Company;
  subsidiary?: CompanySubsidiary;
  approver?: Admin;
}

type AdmissionTrackerState = {
  admissions: AdmissionTracker[];
  setAdmissions: (items: AdmissionTracker[]) => void;
  addAdmission: (item: AdmissionTracker) => void;
  updateAdmission: (id: string, patch: Partial<AdmissionTracker>) => void;
  removeAdmission: (id: string) => void;
  clear: () => void;
};

export const useAdmissionTrackerStore = create<AdmissionTrackerState>(
  (set) => ({
    admissions: [],
    setAdmissions: (items: AdmissionTracker[]) => set({ admissions: items }),
    addAdmission: (item: AdmissionTracker) =>
      set((state) => ({ admissions: [...state.admissions, item] })),
    updateAdmission: (id: string, patch: Partial<AdmissionTracker>) =>
      set((state) => ({
        admissions: state.admissions.map((admission) =>
          admission.id === id ? { ...admission, ...patch } : admission
        ),
      })),
    removeAdmission: (id: string) =>
      set((state) => ({
        admissions: state.admissions.filter((admission) => admission.id !== id),
      })),
    clear: () => set({ admissions: [] }),
  })
);
