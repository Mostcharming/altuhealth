import { create } from "zustand";

export interface PaymentBatchDetail {
  id: string;
  paymentBatchId: string;
  providerId: string;
  period: string;
  claimsCount: number;
  reconciliationCount: number;
  reconciliationAmount: number;
  claimsAmount: number;
  paymentStatus: "pending" | "paid" | "partial" | "disputed";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type PaymentBatchDetailState = {
  paymentBatchDetails: PaymentBatchDetail[];
  setPaymentBatchDetails: (items: PaymentBatchDetail[]) => void;
  addPaymentBatchDetail: (item: PaymentBatchDetail) => void;
  updatePaymentBatchDetail: (
    id: string,
    patch: Partial<PaymentBatchDetail>
  ) => void;
  removePaymentBatchDetail: (id: string) => void;
  clear: () => void;
};

export const usePaymentBatchDetailStore = create<PaymentBatchDetailState>(
  (set) => ({
    paymentBatchDetails: [],
    setPaymentBatchDetails: (items) => set({ paymentBatchDetails: items }),
    addPaymentBatchDetail: (item) =>
      set((state) => ({
        paymentBatchDetails: [item, ...state.paymentBatchDetails],
      })),
    updatePaymentBatchDetail: (id, patch) =>
      set((state) => ({
        paymentBatchDetails: state.paymentBatchDetails.map((pbd) =>
          pbd.id === id ? { ...pbd, ...patch } : pbd
        ),
      })),
    removePaymentBatchDetail: (id) =>
      set((state) => ({
        paymentBatchDetails: state.paymentBatchDetails.filter(
          (pbd) => pbd.id !== id
        ),
      })),
    clear: () => set({ paymentBatchDetails: [] }),
  })
);
