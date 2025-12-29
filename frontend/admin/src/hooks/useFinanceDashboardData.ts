"use client";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

export interface FinanceMetricsData {
  totalClaimsPaid: {
    amount: number;
    percentage: number;
    trend: "up" | "down";
  };
  totalPendingClaims: {
    count: number;
    percentage: number;
    trend: "up" | "down";
  };
  totalInvoiceGenerated: {
    count: number;
    percentage: number;
    trend: "up" | "down";
  };
  totalRevenueCollected: {
    amount: number;
    percentage: number;
    trend: "up" | "down";
  };
}

export interface ChurnRateData {
  data: number[];
}

export interface GrowthRateData {
  data: number[];
}

export interface FunnelChartData {
  data: number[];
}

export interface InvoiceData {
  id: number;
  serialNo: string;
  closeDate: string;
  user: string;
  amount: string;
  status: "Complete" | "Pending" | "Cancelled";
}

export interface ProductPerformanceData {
  drugs: number[];
  services: number[];
}

export interface ActivityData {
  id: number;
  description: string;
  timestamp: string;
  type: "claim" | "invoice" | "payment" | "system";
}

export interface FinanceDashboardData {
  metrics: FinanceMetricsData;
  churnRate: ChurnRateData;
  growthRate: GrowthRateData;
  funnelChart: FunnelChartData;
  invoices: InvoiceData[];
  productPerformance: ProductPerformanceData;
  activities: ActivityData[];
}

// Fetch metrics from API, sample data for the rest
const fetchFinanceDashboardData = async (): Promise<FinanceDashboardData> => {
  let metrics: FinanceMetricsData;
  let churnRate: ChurnRateData;
  let growthRate: GrowthRateData;
  let funnelChart: FunnelChartData;
  let invoices: InvoiceData[];
  let productPerformance: ProductPerformanceData;
  let activities: ActivityData[];

  try {
    // Make actual API call for finance dashboard data
    const response = await apiClient("/admin/dashboard/finance");
    metrics = response.data.metrics;
    churnRate = response.data.churnRate;
    growthRate = response.data.growthRate;
    funnelChart = response.data.funnelChart;
    invoices = response.data.invoices;
    productPerformance = response.data.productPerformance;
    activities = response.data.activities;
  } catch (error) {
    console.warn(
      "Failed to fetch finance dashboard data from API, using default data:",
      error
    );
    // Fallback to zero values if API call fails
    metrics = {
      totalClaimsPaid: {
        amount: 0,
        percentage: 0,
        trend: "up",
      },
      totalPendingClaims: {
        count: 0,
        percentage: 0,
        trend: "up",
      },
      totalInvoiceGenerated: {
        count: 0,
        percentage: 0,
        trend: "up",
      },
      totalRevenueCollected: {
        amount: 0,
        percentage: 0,
        trend: "up",
      },
    };
    churnRate = { data: Array(7).fill(0) };
    growthRate = { data: Array(7).fill(0) };
    funnelChart = { data: Array(8).fill(0) };
    invoices = [];
    productPerformance = {
      drugs: Array(7).fill(0),
      services: Array(7).fill(0),
    };
    activities = [];
  }

  return {
    metrics,
    churnRate,
    growthRate,
    funnelChart,
    invoices,
    productPerformance,
    activities,
  };
};

export const useFinanceDashboardData = () => {
  const [data, setData] = useState<FinanceDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await fetchFinanceDashboardData();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
};
