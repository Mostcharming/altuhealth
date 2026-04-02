// API helper functions for referrer and referral program management
import { apiClient } from "@/lib/apiClient";

export const referrerAPI = {
  // Get list of referrers
  async listReferrers(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.q) searchParams.append("q", params.q);
    if (params?.status) searchParams.append("status", params.status);

    return apiClient(`/admin/referrers/list?${searchParams}`, {
      method: "GET",
    });
  },

  // Get single referrer
  async getReferrer(id: string) {
    return apiClient(`/admin/referrers/${id}`, {
      method: "GET",
    });
  },

  // Create referrer
  async createReferrer(data: Record<string, unknown>) {
    return apiClient("/admin/referrers", {
      method: "POST",
      body: data,
    });
  },

  // Update referrer
  async updateReferrer(id: string, data: Record<string, unknown>) {
    return apiClient(`/admin/referrers/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  // Delete referrer
  async deleteReferrer(id: string) {
    return apiClient(`/admin/referrers/${id}`, {
      method: "DELETE",
    });
  },

  // Get referrer earnings
  async getReferrerEarnings(id: string) {
    return apiClient(`/admin/referrers/${id}/earnings`, {
      method: "GET",
    });
  },

  // Get referrer's referrals
  async getReferrerReferrals(
    id: string,
    params?: { page?: number; limit?: number }
  ) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));

    return apiClient(`/admin/referrers/${id}/referrals?${searchParams}`, {
      method: "GET",
    });
  },

  // Create withdrawal request
  async createWithdrawRequest(id: string, amount: number) {
    return apiClient(`/admin/referrers/${id}/withdraw-request`, {
      method: "POST",
      body: { amount },
    });
  },
};

export const referralProgramAPI = {
  // Get list of programs
  async listPrograms(params?: {
    page?: number;
    limit?: number;
    q?: string;
    status?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", String(params.page));
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.q) searchParams.append("q", params.q);
    if (params?.status) searchParams.append("status", params.status);

    return apiClient(`/admin/referral-programs/list?${searchParams}`, {
      method: "GET",
    });
  },

  // Get single program
  async getProgram(id: string) {
    return apiClient(`/admin/referral-programs/${id}`, {
      method: "GET",
    });
  },

  // Create program
  async createProgram(data: Record<string, unknown>) {
    return apiClient("/admin/referral-programs", {
      method: "POST",
      body: data,
    });
  },

  // Update program
  async updateProgram(id: string, data: Record<string, unknown>) {
    return apiClient(`/admin/referral-programs/${id}`, {
      method: "PUT",
      body: data,
    });
  },

  // Delete program
  async deleteProgram(id: string) {
    return apiClient(`/admin/referral-programs/${id}`, {
      method: "DELETE",
    });
  },

  // Update program status
  async updateProgramStatus(id: string, status: string) {
    return apiClient(`/admin/referral-programs/${id}/status`, {
      method: "PATCH",
      body: { status },
    });
  },
};
