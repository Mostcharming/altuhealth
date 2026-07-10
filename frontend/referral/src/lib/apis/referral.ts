import { apiClient } from "@/lib/apiClient";

export type EarningStatus = "pending" | "confirmed" | "withdrawn";

export interface ReferrerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  referralCode: string;
  status: "active" | "inactive" | "suspended";
  bankName: string | null;
  accountName: string | null;
  accountNumber: string | null;
  totalEarning: number;
  availableBalance: number;
  totalWithdrawn: number;
  picture: string | null;
}

export interface ReferralEarning {
  id: string;
  referredUser: {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string;
    policyNumber: string | null;
  } | null;
  subscriptionAmount: number;
  earnedAmount: number;
  rewardType: "fixed" | "percentage";
  rewardRate: number;
  currency: string;
  status: EarningStatus;
  isWithdrawn: boolean;
  plan: {
    id: string;
    name: string;
  } | null;
  subscriptionPeriod: {
    start: string;
    end: string;
  } | null;
  createdAt: string;
}

export interface ReferralDashboardData {
  referrer: ReferrerProfile;
  summary: {
    totalReferrals: number;
    totalEarned: number;
    confirmedEarnings: number;
    pendingEarnings: number;
  };
  earnings: ReferralEarning[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface ApiResponse<T> {
  error: boolean;
  message: string;
  data: T;
}

export const referralAPI = {
  async getDashboard(params?: {
    page?: number;
    limit?: number;
    status?: EarningStatus | "";
  }): Promise<ApiResponse<ReferralDashboardData>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.status) searchParams.set("status", params.status);

    const query = searchParams.toString();
    return apiClient(`/referrer/dashboard${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  },

  async updateBankDetails(
    bankDetails: BankDetails
  ): Promise<ApiResponse<BankDetails>> {
    return apiClient("/referrer/dashboard/bank-details", {
      method: "PUT",
      body: bankDetails,
    });
  },
};
