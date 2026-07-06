import { create } from "zustand";

export interface Company {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
}

export interface CompanySubsidiary {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string | null;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  planCycle: string;
  annualPremiumPrice: number;
  isActive?: boolean;
}

export interface Subscription {
  id: string;
  code: string;
  companyId: string;
  mode: "parent_only" | "parent_and_subsidiaries";
  subsidiaryId?: string | null;
  startDate: string;
  endDate: string;
  notes?: string | null;
  status: "active" | "suspended" | "inactive" | "expired";
  Company?: Company;
  CompanySubsidiary?: CompanySubsidiary;
  companyPlans?: SubscriptionPlan[];
  createdAt?: string;
  updatedAt?: string;
}

type SubscriptionState = {
  subscriptions: Subscription[];
  setSubscriptions: (items: Subscription[]) => void;
  addSubscription: (item: Subscription) => void;
  updateSubscription: (id: string, patch: Partial<Subscription>) => void;
  removeSubscription: (id: string) => void;
  clear: () => void;
};

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  setSubscriptions: (items) => set({ subscriptions: items }),
  addSubscription: (item) =>
    set((state) => ({ subscriptions: [item, ...state.subscriptions] })),
  updateSubscription: (id, patch) =>
    set((state) => ({
      subscriptions: state.subscriptions.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    })),
  removeSubscription: (id) =>
    set((state) => ({
      subscriptions: state.subscriptions.filter((s) => s.id !== id),
    })),
  clear: () => set({ subscriptions: [] }),
}));
