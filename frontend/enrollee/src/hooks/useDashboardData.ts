import { apiClient } from "@/lib/apiClient";
import { useEffect, useState } from "react";

export interface MetricItem {
  id: number;
  title: string;
  value: string;
  change: string;
  direction: "up" | "down" | "neutral";
  comparisonText: string;
}

export interface RecentProvidersData {
  id: number;
  name: string;
  image: string;
  services: number;
  drugs: number;
  status: string;
}

export interface DashboardData {
  metrics: MetricItem[];
  statisticsChart: {
    medicationsClaimed: number;
    medicationsPercentage: number;
    visitsCompleted: number;
    visitsPercentage: number;
    monthlyData: {
      medications: number[];
      visits: number[];
    };
  };
  healthPlan: {
    daysUntilRenewal: number;
    status: string;
  };
  benefits: {
    availablePercentage: number;
    usedPercentage: number;
    remainingPercentage: number;
    totalBenefits: string;
  };
  appointments: Array<{
    id: number;
    title: string;
    date: string;
    time: string;
    doctor: string;
  }>;
}

// Simulate API call with fake data
const mockDashboardData: DashboardData = {
  metrics: [
    {
      id: 1,
      title: "Medical Visits",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "this month",
    },
    {
      id: 2,
      title: "Medications Used",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "this month",
    },
    {
      id: 3,
      title: "Healthcare Services",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "this month",
    },
  ],
  statisticsChart: {
    medicationsClaimed: 0,
    medicationsPercentage: 0,
    visitsCompleted: 0,
    visitsPercentage: 0,
    monthlyData: {
      medications: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      visits: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  healthPlan: {
    daysUntilRenewal: 0,
    status: "Active",
  },
  benefits: {
    availablePercentage: 0,
    usedPercentage: 0,
    remainingPercentage: 0,
    totalBenefits: "0",
  },
  appointments: [],
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Call the actual API endpoint
        const response = await apiClient("/enrollee/dashboard", {
          method: "GET",
        });

        if (response?.data) {
          setData(response.data);
        } else {
          setData(mockDashboardData);
        }
        setError(null);
      } catch (err) {
        console.warn(
          "[useDashboardData] Failed to fetch dashboard data, using mock data:",
          err,
        );
        // Use mock data as fallback
        setData(mockDashboardData);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}
