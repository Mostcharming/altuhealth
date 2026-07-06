import { create } from "zustand";

export interface Plan {
  id: string;
  name: string;
  code: string;
}

export interface CompanyPlan {
  id: string;
  companyId: string;
  planId: string;
  name: string;
  ageLimit?: number;
  dependentAgeLimit?: number;
  maxNumberOfDependents?: number;
  discountPerEnrolee?: number;
  planCycle: string;
  annualPremiumPrice: number;
  description?: string;
  allowDependentEnrolee?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  Plan?: Plan;
}

type CompanyPlanState = {
  plans: CompanyPlan[];
  setPlans: (items: CompanyPlan[]) => void;
  addPlan: (item: CompanyPlan) => void;
  updatePlan: (id: string, patch: Partial<CompanyPlan>) => void;
  removePlan: (id: string) => void;
  clear: () => void;
};

export const useCompanyPlanStore = create<CompanyPlanState>((set) => ({
  plans: [],
  setPlans: (items) => set({ plans: items }),
  addPlan: (item) => set((state) => ({ plans: [item, ...state.plans] })),
  updatePlan: (id, patch) =>
    set((state) => ({
      plans: state.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
  removePlan: (id) =>
    set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
  clear: () => set({ plans: [] }),
}));
