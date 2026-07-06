import { create } from "zustand";

export interface PaymentAdvice {
  id: string;
  paymentAdviceNumber: string;
  providerId: string;
  provider?: {
    id: string;
    name: string;
    code?: string;
    email?: string;
    phoneNumber?: string;
  };
  paymentBatchId?: string | null;
  totalAmount: number;
  numberOfClaims: number;
  paymentDate: string;
  dueDate?: string | null;
  paymentMethod: "bank_transfer" | "check" | "eft" | "other";
  bankName?: string | null;
  bankAccountNumber?: string | null;
  accountName?: string | null;
  accountType?: string | null;
  sortCode?: string | null;
  routingNumber?: string | null;
  description?: string | null;
  notes?: string | null;
  status: "draft" | "approved" | "sent" | "acknowledged" | "paid" | "failed";
  createdBy?: string;
  updatedBy?: string;
  approvedBy?: string | null;
  approvedDate?: string | null;
  sentDate?: string | null;
  acknowledgedDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

type PaymentAdviceState = {
  paymentAdvices: PaymentAdvice[];
  setPaymentAdvices: (items: PaymentAdvice[]) => void;
  addPaymentAdvice: (item: PaymentAdvice) => void;
  updatePaymentAdvice: (id: string, patch: Partial<PaymentAdvice>) => void;
  removePaymentAdvice: (id: string) => void;
  clear: () => void;
};

export const usePaymentAdviceStore = create<PaymentAdviceState>((set) => ({
  paymentAdvices: [],
  setPaymentAdvices: (items) => set({ paymentAdvices: items }),
  addPaymentAdvice: (item) =>
    set((state) => ({ paymentAdvices: [item, ...state.paymentAdvices] })),
  updatePaymentAdvice: (id, patch) =>
    set((state) => ({
      paymentAdvices: state.paymentAdvices.map((pa) =>
        pa.id === id ? { ...pa, ...patch } : pa
      ),
    })),
  removePaymentAdvice: (id) =>
    set((state) => ({
      paymentAdvices: state.paymentAdvices.filter((pa) => pa.id !== id),
    })),
  clear: () => set({ paymentAdvices: [] }),
}));
