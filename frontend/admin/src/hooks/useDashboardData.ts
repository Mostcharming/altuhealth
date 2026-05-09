"use client";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

export interface MetricsData {
  companies: {
    count: number;
    percentage: number;
    trend: "up" | "down";
  };
  enrollees: {
    count: number;
    percentage: number;
    trend: "up" | "down";
  };
}

export interface MonthlySalesData {
  data: number[];
}

export interface StaffEnrollmentData {
  totalStaff: number;
  activated: number;
  pending: number;
  enrollmentPercentage: number;
}

export interface StatisticsData {
  retailEnrollees: number[];
  activeDependentEnrollees: number[];
}

export interface DemographicData {
  country: string;
  enrollees: number;
  flag: string;
}

export interface RecentProvidersData {
  id: number;
  name: string;
  services: number;
  drugs: number;
  status: "Active" | "Inactive" | "Pending";
  image: string;
}

export interface DashboardData {
  metrics: MetricsData;
  monthlySales: MonthlySalesData;
  staffEnrollment: StaffEnrollmentData;
  statistics: StatisticsData;
  demographics: DemographicData[];
  recentProviders: RecentProvidersData[];
}

// Fetch metrics from API, sample data for the rest
const fetchDashboardData = async (): Promise<DashboardData> => {
  let metrics: MetricsData;
  let monthlySales: MonthlySalesData;
  let staffEnrollment: StaffEnrollmentData;
  let statistics: StatisticsData;
  let demographics: DemographicData[];
  let recentProviders: RecentProvidersData[];

  try {
    // Make actual API call for metrics
    const response = await apiClient("/admin/dashboard/overview");
    metrics = response.data.metrics;
    monthlySales = response.data.monthlySales;
    staffEnrollment = response.data.staffEnrollment;
    statistics = response.data.statistics;
    demographics = response.data.demographics;
    recentProviders = response.data.recentProviders;
  } catch (error) {
    console.warn(
      "Failed to fetch metrics from API, using default data:",
      error
    );
    // Fallback to zero values if API call fails
    metrics = {
      companies: {
        count: 0,
        percentage: 0,
        trend: "up",
      },
      enrollees: {
        count: 0,
        percentage: 0,
        trend: "up",
      },
    };
    monthlySales = { data: Array(12).fill(0) };
    staffEnrollment = {
      totalStaff: 0,
      activated: 0,
      pending: 0,
      enrollmentPercentage: 0,
    };
    statistics = {
      retailEnrollees: Array(12).fill(0),
      activeDependentEnrollees: Array(12).fill(0),
    };
    demographics = [];
    recentProviders = [];
  }

  return {
    metrics,
    monthlySales,
    staffEnrollment,
    statistics,
    demographics,
    recentProviders,
  };
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await fetchDashboardData();
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
