import { create } from "zustand";

export interface BenefitCategory {
  id: string;
  name: string;
  count: number;
}

export interface EnrolleeBenefit {
  id: string;
  name: string;
  description?: string;
  limit?: string;
  amount: number;
  benefitCategoryId: string;
  BenefitCategory?: BenefitCategory;
  createdAt?: string;
  updatedAt?: string;
}

type EnrolleeBenefitState = {
  benefits: EnrolleeBenefit[];
  categories: BenefitCategory[];
  setBenefits: (items: EnrolleeBenefit[]) => void;
  setCategories: (items: BenefitCategory[]) => void;
  addBenefit: (item: EnrolleeBenefit) => void;
  removeBenefit: (id: string) => void;
  clear: () => void;
};

export const useEnrolleeBenefitStore = create<EnrolleeBenefitState>((set) => ({
  benefits: [],
  categories: [],
  setBenefits: (items) => set({ benefits: items }),
  setCategories: (items) => set({ categories: items }),
  addBenefit: (item) =>
    set((state) => ({ benefits: [item, ...state.benefits] })),
  removeBenefit: (id) =>
    set((state) => ({
      benefits: state.benefits.filter((b) => b.id !== id),
    })),
  clear: () => set({ benefits: [], categories: [] }),
}));
