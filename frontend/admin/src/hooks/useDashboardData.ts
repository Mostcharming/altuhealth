"use client";
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

// Simulated API call
const fetchDashboardData = async (): Promise<DashboardData> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    metrics: {
      companies: {
        count: 145,
        percentage: 12.5,
        trend: "up",
      },
      enrollees: {
        count: 2840,
        percentage: 8.3,
        trend: "down",
      },
    },
    monthlySales: {
      data: [45, 78, 123, 98, 156, 189, 201, 167, 195, 234, 212, 267],
    },
    staffEnrollment: {
      totalStaff: 450,
      activated: 385,
      pending: 65,
      enrollmentPercentage: 85.56,
    },
    statistics: {
      retailEnrollees: [
        125, 234, 345, 456, 567, 678, 789, 890, 901, 812, 723, 634,
      ],
      activeDependentEnrollees: [
        89, 156, 213, 298, 387, 476, 523, 612, 698, 745, 812, 889,
      ],
    },
    demographics: [
      {
        country: "Nigeria",
        enrollees: 1245,
        flag: "/images/country/country-ng.svg",
      },
      {
        country: "Ghana",
        enrollees: 892,
        flag: "/images/country/country-gh.svg",
      },
      {
        country: "Kenya",
        enrollees: 703,
        flag: "/images/country/country-ke.svg",
      },
    ],
    recentProviders: [
      {
        id: 1,
        name: "Dr. Sarah Johnson",
        services: 15,
        drugs: 42,
        status: "Active",
        image: "/images/provider/provider-01.jpg",
      },
      {
        id: 2,
        name: "Dr. Kwame Mensah",
        services: 12,
        drugs: 38,
        status: "Active",
        image: "/images/provider/provider-02.jpg",
      },
      {
        id: 3,
        name: "Dr. James Kipchoge",
        services: 8,
        drugs: 25,
        status: "Pending",
        image: "/images/provider/provider-03.jpg",
      },
      {
        id: 4,
        name: "Dr. Amara Okafor",
        services: 10,
        drugs: 31,
        status: "Active",
        image: "/images/provider/provider-04.jpg",
      },
      {
        id: 5,
        name: "Dr. Grace Asiimwe",
        services: 14,
        drugs: 45,
        status: "Inactive",
        image: "/images/provider/provider-05.jpg",
      },
    ],
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
