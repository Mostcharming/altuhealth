import { create } from "zustand";

export interface Company {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type CompanyState = {
  companies: Company[];
  setCompanies: (items: Company[]) => void;
  addCompany: (item: Company) => void;
  updateCompany: (id: string, patch: Partial<Company>) => void;
  removeCompany: (id: string) => void;
  clear: () => void;
};

export const useCompanyStore = create<CompanyState>((set) => ({
  companies: [],
  setCompanies: (items) => set({ companies: items }),
  addCompany: (item) =>
    set((state) => ({ companies: [item, ...state.companies] })),
  updateCompany: (id, patch) =>
    set((state) => ({
      companies: state.companies.map((c) =>
        c.id === id ? { ...c, ...patch } : c
      ),
    })),
  removeCompany: (id) =>
    set((state) => ({ companies: state.companies.filter((c) => c.id !== id) })),
  clear: () => set({ companies: [] }),
}));
