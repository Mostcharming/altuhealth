import { create } from "zustand";

export interface PaymentBatch {
  id: string;
  title: string;
  description?: string | null;
  numberOfBatches: number;
  numberOfProviders: number;
  conflictCount: number;
  totalClaimsAmount: number;
  reconciliationAmount: number;
  status: "pending" | "processing" | "completed" | "failed" | "partial";
  isPaid: boolean;
  numberPaid: number;
  numberUnpaid: number;
  paidAmount: number;
  unpaidAmount: number;
  paymentDate?: string | null;
  dueDate?: string | null;
  notes?: string | null;
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string | null;
  approvedDate?: string | null;
  processingNotes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type PaymentBatchState = {
  paymentBatches: PaymentBatch[];
  setPaymentBatches: (items: PaymentBatch[]) => void;
  addPaymentBatch: (item: PaymentBatch) => void;
  updatePaymentBatch: (id: string, patch: Partial<PaymentBatch>) => void;
  removePaymentBatch: (id: string) => void;
  clear: () => void;
};

export const usePaymentBatchStore = create<PaymentBatchState>((set) => ({
  paymentBatches: [],
  setPaymentBatches: (items) => set({ paymentBatches: items }),
  addPaymentBatch: (item) =>
    set((state) => ({ paymentBatches: [item, ...state.paymentBatches] })),
  updatePaymentBatch: (id, patch) =>
    set((state) => ({
      paymentBatches: state.paymentBatches.map((pb) =>
        pb.id === id ? { ...pb, ...patch } : pb
      ),
    })),
  removePaymentBatch: (id) =>
    set((state) => ({
      paymentBatches: state.paymentBatches.filter((pb) => pb.id !== id),
    })),
  clear: () => set({ paymentBatches: [] }),
}));
