import { create } from "zustand";

export interface ProviderSpecialization {
  id: string;
  name: string;
  description?: string | null;
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
}

export interface Provider {
  id: string;
  code: string;
  upn: string;
  name: string;
  category: "primary" | "secondary" | "tertiary" | "specialized";
  email: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string | null;
  website?: string | null;
  country: string;
  state: string;
  lga?: string | null;
  address: string;
  providerArea?: string | null;
  bank: string;
  accountName: string;
  accountNumber: string;
  bankBranch?: string | null;
  paymentBatch: "batch_a" | "batch_b" | "batch_c" | "batch_d";
  status: "active" | "inactive" | "suspended" | "pending_approval";
  isDeleted?: boolean;
  managerId?: string;
  manager?: Manager;
  providerSpecializationId?: string | null;
  ProviderSpecialization?: ProviderSpecialization | null;
  Plans?: Plan[];
  createdAt?: string;
  updatedAt?: string;
}

type ProviderState = {
  providers: Provider[];
  setProviders: (items: Provider[]) => void;
  addProvider: (item: Provider) => void;
  updateProvider: (id: string, patch: Partial<Provider>) => void;
  removeProvider: (id: string) => void;
  clear: () => void;
};

export const useProviderStore = create<ProviderState>((set) => ({
  providers: [],
  setProviders: (items) => set({ providers: items }),
  addProvider: (item) =>
    set((state) => ({ providers: [item, ...state.providers] })),
  updateProvider: (id, patch) =>
    set((state) => ({
      providers: state.providers.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),
  removeProvider: (id) =>
    set((state) => ({ providers: state.providers.filter((p) => p.id !== id) })),
  clear: () => set({ providers: [] }),
}));
