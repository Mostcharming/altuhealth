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
  enrollee: {
    firstName: string;
    lastName: string;
    policyNumber: string;
  };
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
    renewalDate: string | null;
    status: string;
    name: string | null;
    currency: string | null;
  };
  benefits: {
    totalBenefits: number;
    authorizationRequests: number;
    usedAuthorizations: number;
    activeAuthorizations: number;
    usedPercentage: number;
    remainingPercentage: number;
  };
  appointments: Array<{
    id: string;
    title: string;
    date: string;
    time: string;
    doctor: string;
    status: string;
  }>;
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient("/enrollee/dashboard", {
          method: "GET",
        });

        if (!response?.data) {
          throw new Error("The dashboard response did not contain any data.");
        }

        setData(response.data);
        setError(null);
      } catch (err) {
        setData(null);
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, isLoading, error };
}
