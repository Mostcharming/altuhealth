/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";

export interface Benefit {
  BenefitCategory: any;
  id: string;
  name: string;
  description?: string | null;
  benefitCategoryId: string;
  isCovered?: boolean;
  coverageType?: string | null;
  coverageValue?: string | null;
  benefitCategory?: {
    id: string;
    name: string;
    count: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

type BenefitState = {
  benefits: Benefit[];
  setBenefits: (items: Benefit[]) => void;
  addBenefit: (item: Benefit) => void;
  updateBenefit: (id: string, patch: Partial<Benefit>) => void;
  removeBenefit: (id: string) => void;
  getBenefitsByCategory: (categoryId: string) => Benefit[];
  clear: () => void;
};

export const useBenefitStore = create<BenefitState>((set, get) => ({
  benefits: [],
  setBenefits: (items) => set({ benefits: items }),
  addBenefit: (item) =>
    set((state) => ({ benefits: [item, ...state.benefits] })),
  updateBenefit: (id, patch) =>
    set((state) => ({
      benefits: state.benefits.map((b) =>
        b.id === id ? { ...b, ...patch } : b
      ),
    })),
  removeBenefit: (id) =>
    set((state) => ({
      benefits: state.benefits.filter((b) => b.id !== id),
    })),
  getBenefitsByCategory: (categoryId) => {
    const { benefits } = get();
    return benefits.filter(
      (benefit) => benefit.benefitCategoryId === categoryId
    );
  },
  clear: () => set({ benefits: [] }),
}));
