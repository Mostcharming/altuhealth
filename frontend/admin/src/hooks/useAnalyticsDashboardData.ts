"use client";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

export interface AnalyticsMetricsData {
  activeSubscriptions: {
    count: number;
    percentage: number;
    trend: "up" | "down";
  };
  expiredSubscriptions: {
    count: number;
    percentage: number;
    trend: "up" | "down";
  };
  aboutToExpire: {
    count: number;
    percentage: number;
    trend: "up" | "down";
  };
}

export interface SalePieChartData {
  highestPlans: number;
  mostServices: number;
  highestEnrollees: number;
}

export interface UpcomingSessionData {
  id: number;
  doctorName: string;
  specialty: string;
  sessionDate: string;
  sessionTime: string;
  patientName: string;
  status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled";
}

export interface DoctorAnalyticsData {
  id: string;
  user: {
    initials: string;
    name: string;
    email: string;
  };
  avatarColor: "brand" | "blue" | "green" | "red" | "yellow" | "gray";
  isOnline: boolean;
  availableTime: string;
  bookingsCount: number;
  specialty: string;
  rating?: number;
  totalPatients?: number;
}

export interface AnalyticsDashboardData {
  metrics: AnalyticsMetricsData;
  saleChart: SalePieChartData;
  upcomingSessions: UpcomingSessionData[];
  doctors: DoctorAnalyticsData[];
}

const fetchAnalyticsDashboardData =
  async (): Promise<AnalyticsDashboardData> => {
    let metrics: AnalyticsMetricsData;
    let saleChart: SalePieChartData;
    let upcomingSessions: UpcomingSessionData[];
    let doctors: DoctorAnalyticsData[];

    try {
      const response = await apiClient("/admin/dashboard/analytics");
      metrics = response.data.metrics;
      saleChart = response.data.saleChart;
      upcomingSessions = response.data.upcomingSessions;
      doctors = response.data.doctors;
    } catch (error) {
      console.warn(
        "Failed to fetch analytics dashboard data from API, using default data:",
        error
      );
      // Fallback to empty/zero values if API call fails
      metrics = {
        activeSubscriptions: {
          count: 0,
          percentage: 0,
          trend: "up",
        },
        expiredSubscriptions: {
          count: 0,
          percentage: 0,
          trend: "down",
        },
        aboutToExpire: {
          count: 0,
          percentage: 0,
          trend: "up",
        },
      };
      saleChart = {
        highestPlans: 0,
        mostServices: 0,
        highestEnrollees: 0,
      };
      upcomingSessions = [];
      doctors = [];
    }

    return {
      metrics,
      saleChart,
      upcomingSessions,
      doctors,
    };
  };

export const useAnalyticsDashboardData = () => {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const dashboardData = await fetchAnalyticsDashboardData();
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
