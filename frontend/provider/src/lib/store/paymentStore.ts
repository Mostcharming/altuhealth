import { create } from "zustand";

export interface Payment {
  id: string;
  invoiceId: string;
  paymentNumber: string;
  paymentAmount: number;
  paymentDate: string;
  paymentMethod: "bank_transfer" | "cheque" | "cash" | "card" | "gateway";
  currency: string;
  transactionReference?: string | null;
  bankName?: string | null;
  accountName?: string | null;
  chequeNumber?: string | null;
  chequeDate?: string | null;
  paymentGatewayProvider?: string | null;
  paymentGatewayTransactionId?: string | null;
  description?: string | null;
  receiptUrl?: string | null;
  status: "completed" | "pending" | "failed" | "refunded";
  verificationStatus: "verified" | "unverified";
  processedBy?: string | null;
  processedByType?: string;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Invoice?: {
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    Provider?: {
      id: string;
      name: string;
    };
  };
}

type PaymentState = {
  payments: Payment[];
  setPayments: (items: Payment[]) => void;
  addPayment: (item: Payment) => void;
  updatePayment: (id: string, patch: Partial<Payment>) => void;
  removePayment: (id: string) => void;
  clear: () => void;
};

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  setPayments: (items) => set({ payments: items }),
  addPayment: (item) =>
    set((state) => ({ payments: [item, ...state.payments] })),
  updatePayment: (id, patch) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === id ? { ...payment, ...patch } : payment
      ),
    })),
  removePayment: (id) =>
    set((state) => ({
      payments: state.payments.filter((payment) => payment.id !== id),
    })),
  clear: () => set({ payments: [] }),
}));
