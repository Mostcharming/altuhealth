/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export interface AdminApproval {
  id: string;
  model: string;
  modelId: string;
  action: "create" | "update" | "delete" | "other";
  details: any;
  status: "pending" | "approved" | "declined";
  requestedBy: string;
  requestedByType?: string;
  requestedByAdmin?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role?: string;
  };
  actionedBy?: string;
  actionedByType?: string;
  comments?: string;
  meta?: any;
  dueAt?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApprovalsStore {
  approvals: AdminApproval[];
  setApprovals: (approvals: AdminApproval[]) => void;
  addApproval: (approval: AdminApproval) => void;
  updateApproval: (id: string, approval: Partial<AdminApproval>) => void;
  removeApproval: (id: string) => void;
}

export const useApprovalsStore = create<ApprovalsStore>((set) => ({
  approvals: [],
  setApprovals: (approvals) => set({ approvals }),
  addApproval: (approval) =>
    set((state) => ({ approvals: [approval, ...state.approvals] })),
  updateApproval: (id, approval) =>
    set((state) => ({
      approvals: state.approvals.map((a) =>
        a.id === id ? { ...a, ...approval } : a
      ),
    })),
  removeApproval: (id) =>
    set((state) => ({
      approvals: state.approvals.filter((a) => a.id !== id),
    })),
}));
