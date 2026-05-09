import { create } from "zustand";

export interface UtilizationReview {
  id: string;
  companyId: string;
  companyPlanId: string;
  policyPeriodStartDate: string;
  policyPeriodEndDate: string;
  quarter: string;
  totalEnrollees: number;
  totalDependents: number;
  totalClaimAmount: number;
  utilizationRate: number;
  topUtilizedServices?: string[] | null;
  topProviders?: string[] | null;
  excludedServiceAttempts: number;
  status?: "draft" | "completed" | "approved" | null;
  Company?: {
    id: string;
    name: string;
    email?: string;
  };
  CompanyPlan?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

type UtilizationReviewState = {
  reviews: UtilizationReview[];
  setReviews: (items: UtilizationReview[]) => void;
  addReview: (item: UtilizationReview) => void;
  updateReview: (id: string, patch: Partial<UtilizationReview>) => void;
  removeReview: (id: string) => void;
  clear: () => void;
};

export const useUtilizationReviewStore = create<UtilizationReviewState>(
  (set) => ({
    reviews: [],
    setReviews: (items) => set({ reviews: items }),
    addReview: (item) =>
      set((state) => ({ reviews: [item, ...state.reviews] })),
    updateReview: (id, patch) =>
      set((state) => ({
        reviews: state.reviews.map((r) =>
          r.id === id ? { ...r, ...patch } : r
        ),
      })),
    removeReview: (id) =>
      set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) })),
    clear: () => set({ reviews: [] }),
  })
);
