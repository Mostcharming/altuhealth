import { create } from "zustand";

export interface RetailEnrollee {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  state?: string | null;
  lga?: string | null;
  country?: string | null;
  maxDependents?: number | null;
  planId: string;
  subscriptionStartDate: string;
  subscriptionEndDate?: string | null;
  soldByUserId?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type RetailEnrolleeState = {
  retailEnrollees: RetailEnrollee[];
  setRetailEnrollees: (items: RetailEnrollee[]) => void;
  addRetailEnrollee: (item: RetailEnrollee) => void;
  updateRetailEnrollee: (id: string, patch: Partial<RetailEnrollee>) => void;
  removeRetailEnrollee: (id: string) => void;
  clear: () => void;
};

export const useRetailEnrolleeStore = create<RetailEnrolleeState>((set) => ({
  retailEnrollees: [],
  setRetailEnrollees: (items) => set({ retailEnrollees: items }),
  addRetailEnrollee: (item) =>
    set((state) => ({ retailEnrollees: [item, ...state.retailEnrollees] })),
  updateRetailEnrollee: (id, patch) =>
    set((state) => ({
      retailEnrollees: state.retailEnrollees.map((e) =>
        e.id === id ? { ...e, ...patch } : e
      ),
    })),
  removeRetailEnrollee: (id) =>
    set((state) => ({
      retailEnrollees: state.retailEnrollees.filter((e) => e.id !== id),
    })),
  clear: () => set({ retailEnrollees: [] }),
}));
