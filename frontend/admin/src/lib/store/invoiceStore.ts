import { create } from "zustand";

export interface InvoiceLineItem {
  id?: string;
  invoiceId?: string;
  itemNumber?: number;
  serviceName?: string;
  description: string;
  quantity: number | string;
  unitPrice?: number;
  unitCost?: number;
  unitOfMeasure?: string;
  discount?: number;
  discountAmount?: number;
  tax?: number;
  taxAmount?: number;
  amount?: number;
  subtotal?: number | string;
  lineTotal?: number | string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  providerId?: string;
  enrolleeId?: string | null;
  retailEnrolleeId?: string | null;
  customerName: string;
  customerAddress?: string | null;
  customerPhone?: string | null;
  customerEmail?: string | null;
  invoiceDate: string;
  dueDate?: string | null;
  subtotal: number | string;
  discountAmount: number | string;
  discountPercentage?: number | null;
  taxAmount: number | string;
  taxPercentage?: number | null;
  totalAmount: number | string;
  paidAmount: number | string;
  balanceAmount: number | string;
  status: "issued" | "overdue" | "cancelled" | "paid" | "partially_paid";
  paymentStatus: "unpaid" | "paid" | "partially_paid";
  currency?: string;
  notes?: string | null;
  description?: string | null;
  issuedBy?: string | null;
  issuedByType?: string;
  issuedByAdmin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
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
