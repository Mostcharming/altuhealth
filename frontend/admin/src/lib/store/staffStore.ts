import { create } from "zustand";

export interface Staff {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phoneNumber: string;
  staffId: string;
  companyId: string;
  subsidiaryId?: string | null;
  dateOfBirth?: string | null;
  maxDependents?: number | null;
  preexistingMedicalRecords?: string | null;
  subscriptionId?: string | null;
  enrollmentStatus: "enrolled" | "not_enrolled";
  isNotified: boolean;
  notifiedAt?: string | null;
  isActive: boolean;
  Company?: { id: string; name: string };
  CompanySubsidiary?: { id: string; name: string };
  Subscription?: { id: string; code: string };
  createdAt?: string;
  updatedAt?: string;
}

type StaffState = {
  staffs: Staff[];
  setStaffs: (items: Staff[]) => void;
  addStaff: (item: Staff) => void;
  updateStaff: (id: string, patch: Partial<Staff>) => void;
  removeStaff: (id: string) => void;
  clear: () => void;
};

export const useStaffStore = create<StaffState>((set) => ({
  staffs: [],
  setStaffs: (items) => set({ staffs: items }),
  addStaff: (item) => set((state) => ({ staffs: [item, ...state.staffs] })),
  updateStaff: (id, patch) =>
    set((state) => ({
      staffs: state.staffs.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })),
  removeStaff: (id) =>
    set((state) => ({ staffs: state.staffs.filter((s) => s.id !== id) })),
  clear: () => set({ staffs: [] }),
}));
