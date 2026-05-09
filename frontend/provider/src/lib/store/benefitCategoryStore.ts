import { create } from "zustand";

export interface BenefitCategory {
  id: string;
  name: string;
  count: number;
  createdAt?: string;
  updatedAt?: string;
}

type BenefitCategoryState = {
  benefitCategories: BenefitCategory[];
  setBenefitCategories: (items: BenefitCategory[]) => void;
  addBenefitCategory: (item: BenefitCategory) => void;
  updateBenefitCategory: (id: string, patch: Partial<BenefitCategory>) => void;
  removeBenefitCategory: (id: string) => void;
  incrementCount: (id: string) => void;
  decrementCount: (id: string) => void;
  clear: () => void;
};

export const useBenefitCategoryStore = create<BenefitCategoryState>((set) => ({
  benefitCategories: [],
  setBenefitCategories: (items) => set({ benefitCategories: items }),
  addBenefitCategory: (item) =>
    set((state) => ({ benefitCategories: [item, ...state.benefitCategories] })),
  updateBenefitCategory: (id, patch) =>
    set((state) => ({
      benefitCategories: state.benefitCategories.map((bc) =>
        bc.id === id ? { ...bc, ...patch } : bc
      ),
    })),
  removeBenefitCategory: (id) =>
    set((state) => ({
      benefitCategories: state.benefitCategories.filter((bc) => bc.id !== id),
    })),
  incrementCount: (id) =>
    set((state) => ({
      benefitCategories: state.benefitCategories.map((bc) =>
        bc.id === id ? { ...bc, count: bc.count + 1 } : bc
      ),
    })),
  decrementCount: (id) =>
    set((state) => ({
      benefitCategories: state.benefitCategories.map((bc) =>
        bc.id === id ? { ...bc, count: Math.max(0, bc.count - 1) } : bc
      ),
    })),
  clear: () => set({ benefitCategories: [] }),
}));
