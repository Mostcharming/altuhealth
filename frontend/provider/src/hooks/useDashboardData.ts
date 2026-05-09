import { useEffect, useState } from "react";

export interface ProviderMetricItem {
  id: number;
  title: string;
  value: string;
  change: string;
  direction: "up" | "down" | "neutral";
  comparisonText: string;
}

export interface ProviderAppointment {
  id: number;
  title: string;
  date: string;
  time: string;
  enrolleeName: string;
}

export interface ProviderDashboardData {
  metrics: ProviderMetricItem[];
  statisticsChart: {
    drugsUsed: number;
    drugsPercentage: number;
    servicesUsed: number;
    servicesPercentage: number;
    monthlyData: {
      drugs: number[];
      services: number[];
    };
  };
  bills: {
    totalBilled: string;
    billsPaid: string;
    billsPaidPercentage: number;
    billsDraft: string;
    billsDraftPercentage: number;
  };
  authorizationCodes: {
    requestedCount: number;
    requestedPercentage: number;
    usedCount: number;
    usedPercentage: number;
    cancelledCount: number;
    cancelledPercentage: number;
  };
  appointments: ProviderAppointment[];
}

// Mock data for provider dashboard
const mockProviderDashboardData: ProviderDashboardData = {
  metrics: [
    {
      id: 1,
      title: "Enrollee Visits",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "this month",
    },
    {
      id: 2,
      title: "Total Drugs",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "this month",
    },
    {
      id: 3,
      title: "Total Services",
      value: "0",
      change: "+0%",
      direction: "up",
      comparisonText: "this month",
    },
  ],
  statisticsChart: {
    drugsUsed: 0,
    drugsPercentage: 0,
    servicesUsed: 0,
    servicesPercentage: 0,
    monthlyData: {
      drugs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      services: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  },
  bills: {
    totalBilled: "0",
    billsPaid: "NGN 0.00",
    billsPaidPercentage: 0,
    billsDraft: "NGN 0.00",
    billsDraftPercentage: 0,
  },
  authorizationCodes: {
    requestedCount: 0,
    requestedPercentage: 0,
    usedCount: 0,
    usedPercentage: 0,
    cancelledCount: 0,
    cancelledPercentage: 0,
  },
  appointments: [],
};

export function useProviderDashboardData() {
  const [data, setData] = useState<ProviderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call with delay
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In a real app, you would call:
        // const response = await apiClient("/provider/dashboard");
        // const data = await response.data;

        setData(mockProviderDashboardData);
        setError(null);
      } catch (err) {
        console.warn(
          "[useProviderDashboardData] Failed to fetch dashboard data:",
          err,
        );
        // Use mock data as fallback
        setData(mockProviderDashboardData);
        setError(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}
