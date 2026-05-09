import { create } from "zustand";

export interface CompanySubsidiary {
  id: string;
  companyId: string;
  name: string;
  registrationNumber?: string;
  email: string;
  phoneNumber: string;
  secondaryPhoneNumber?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode?: string;
  website?: string;
  industryType?: string;
  numberOfEmployees?: number;
  contactPersonName: string;
  contactPersonTitle?: string;
  contactPersonEmail?: string;
  contactPersonPhoneNumber?: string;
  taxIdentificationNumber?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  subsidiaryType?: string;
  establishmentDate?: string;
  operatingLicense?: string;
  licenseExpiryDate?: string;
  parentSubsidiaryId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type CompanySubsidiaryState = {
  subsidiaries: CompanySubsidiary[];
  setSubsidiaries: (items: CompanySubsidiary[]) => void;
  addSubsidiary: (item: CompanySubsidiary) => void;
  updateSubsidiary: (id: string, patch: Partial<CompanySubsidiary>) => void;
  removeSubsidiary: (id: string) => void;
  clear: () => void;
};

export const useCompanySubsidiaryStore = create<CompanySubsidiaryState>(
  (set) => ({
    subsidiaries: [],
    setSubsidiaries: (items) => set({ subsidiaries: items }),
    addSubsidiary: (item) =>
      set((state) => ({ subsidiaries: [item, ...state.subsidiaries] })),
    updateSubsidiary: (id, patch) =>
      set((state) => ({
        subsidiaries: state.subsidiaries.map((s) =>
          s.id === id ? { ...s, ...patch } : s
        ),
      })),
    removeSubsidiary: (id) =>
      set((state) => ({
        subsidiaries: state.subsidiaries.filter((s) => s.id !== id),
      })),
    clear: () => set({ subsidiaries: [] }),
  })
);
