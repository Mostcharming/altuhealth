import { create } from "zustand";

export interface BenefitCategory {
  id: string;
  name: string;
}

export interface Exclusion {
  id: string;
  description: string;
}

export interface Provider {
  id: string;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  status?: string;
  isActive?: boolean;
  isApproved?: boolean;
  ageLimit?: number;
  dependentAgeLimit?: number;
  maxNumberOfDependents?: number;
  discountPerEnrolee?: number;
  planCycle?: string;
  annualPremiumPrice?: number;
  allowDependentEnrolee?: boolean;
  createdAt?: string;
  updatedAt?: string;
  benefitCategories?: BenefitCategory[];
  exclusions?: Exclusion[];
  providers?: Provider[];
}

type PlanState = {
  plans: Plan[];
  setPlans: (items: Plan[]) => void;
  addPlan: (item: Plan) => void;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  removePlan: (id: string) => void;
  clear: () => void;
};

export const usePlanStore = create<PlanState>((set) => ({
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
