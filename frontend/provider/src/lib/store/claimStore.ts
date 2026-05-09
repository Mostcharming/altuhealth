import { create } from "zustand";

export interface Claim {
  id: string;
  providerId: string;
  numberOfEncounters: number;
  amountSubmitted: number;
  amountProcessed: number;
  difference: number;
  year: number;
  month: number;
  dateSubmitted: string;
  datePaid?: string | null;
  bankUsedForPayment?: string | null;
  bankAccountNumber?: string | null;
  accountName?: string | null;
  paymentBatchId?: string | null;
  submittedByType: "Admin" | "Enrollee" | "Provider" | "Staff";
  submittedById: string;
  status:
    | "draft"
    | "submitted"
    | "pending_vetting"
    | "under_review"
    | "awaiting_payment"
    | "paid"
    | "rejected"
    | "partially_paid"
    | "queried";
  rejectionReason?: string | null;
  vetterNotes?: string | null;
  claimReference: string;
  description?: string | null;
  attachmentUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Provider?: {
    id: string;
    name: string;
    code: string;
    email: string;
    phoneNumber: string;
  };
}

type ClaimState = {
  claims: Claim[];
  setClaims: (items: Claim[]) => void;
  addClaim: (item: Claim) => void;
  updateClaim: (id: string, patch: Partial<Claim>) => void;
  removeClaim: (id: string) => void;
  clear: () => void;
};

export const useClaimStore = create<ClaimState>((set) => ({
  claims: [],
  setClaims: (items) => set({ claims: items }),
  addClaim: (item) => set((state) => ({ claims: [item, ...state.claims] })),
  updateClaim: (id, patch) =>
    set((state) => ({
      claims: state.claims.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  removeClaim: (id) =>
    set((state) => ({
      claims: state.claims.filter((c) => c.id !== id),
    })),
  clear: () => set({ claims: [] }),
}));
