import { create } from "zustand";

export interface InvoiceLineItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  amount: number;
}

export interface Invoice {
  id: string;
  providerId: string;
  enrolleeId?: string | null;
  retailEnrolleeId?: string | null;
  customerName: string;
  customerAddress?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: "issued" | "overdue" | "cancelled" | "paid" | "partially_paid";
  paymentStatus: "unpaid" | "paid" | "partially_paid";
  notes?: string | null;
  description?: string | null;
  issuedBy?: string | null;
  issuedByType?: string;
  lineItems?: InvoiceLineItem[];
  Provider?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

type InvoiceState = {
  invoices: Invoice[];
  setInvoices: (items: Invoice[]) => void;
  addInvoice: (item: Invoice) => void;
  updateInvoice: (id: string, patch: Partial<Invoice>) => void;
  removeInvoice: (id: string) => void;
  clear: () => void;
};

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  setInvoices: (items) => set({ invoices: items }),
  addInvoice: (item) =>
    set((state) => ({ invoices: [item, ...state.invoices] })),
  updateInvoice: (id, patch) =>
    set((state) => ({
      invoices: state.invoices.map((inv) =>
        inv.id === id ? { ...inv, ...patch } : inv
      ),
    })),
  removeInvoice: (id) =>
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id),
    })),
  clear: () => set({ invoices: [] }),
}));
