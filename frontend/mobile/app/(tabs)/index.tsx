import { FeatureCard } from "@/components/enrollee/FeatureCard";
import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { enrolleeStats, quickActions } from "@/data/enrollee";
import { useAuthStore } from "@/lib/authStore";
import { fetchDashboard, DashboardData } from "@/lib/enrolleeApi";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image } from "react-native";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const data = await fetchDashboard();
        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load dashboard"
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (!dashboard) {
      return enrolleeStats;
    }

    return [
      {
        label: "Plan status",
        value: dashboard.healthPlan?.status || "Active",
      },
      {
        label: "Renewal",
        value: `${dashboard.healthPlan?.daysUntilRenewal ?? 0} days`,
      },
      {
        label: "Benefits",
        value: dashboard.benefits?.totalBenefits || "0",
      },
      {
        label: "Appointments",
        value: String(dashboard.appointments?.length || 0),
      },
    ];
  }, [dashboard]);

  const enrolleeName =
    [user?.firstName || dashboard?.enrollee?.firstName, user?.lastName || dashboard?.enrollee?.lastName]
      .filter(Boolean)
      .join(" ") ||
    user?.email ||
    "Enrollee";
  const policyNumber =
    user?.policyNumber || dashboard?.enrollee?.policyNumber || "Not available";
  const initials = enrolleeName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader
        eyebrow="Enrollee"
        title="Welcome back"
        description="Manage your cover, appointments, benefits, and support from one place."
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Box className="items-center rounded-2xl border border-outline-100 bg-background-0 p-5">
            <ActivityIndicator color="#1e63e9" />
            <Text className="mt-3 text-sm text-typography-500">
              Loading dashboard
            </Text>
          </Box>
        ) : null}

        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}

        <Box
          className="rounded-[32px] border border-primary-100 bg-primary-0 p-5"
          style={{
            shadowColor: "#3b82f6",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 4,
          }}
        >
          <HStack className="items-center" space="md">
            {user?.picture ? (
              <Image
                source={{ uri: user.picture }}
                className="h-20 w-20 rounded-full border-4 border-white"
              />
            ) : (
              <Box className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary-500">
                <Text className="text-2xl font-bold text-white">
                  {initials || "A"}
                </Text>
              </Box>
            )}

            <VStack className="flex-1" space="xs">
              <Text className="text-sm font-semibold uppercase text-primary-800">
                Policy Number
              </Text>
              <Text className="text-2xl font-bold text-typography-900">
                {policyNumber}
              </Text>
              <Text className="text-base font-semibold text-primary-950">
                {enrolleeName}
              </Text>
            </VStack>
          </HStack>
        </Box>

        <HStack className="flex-wrap" space="sm">
          {stats.map((stat) => (
            <Box
              key={stat.label}
              className="mb-3 min-h-24 flex-1 basis-[45%] rounded-[26px] border border-primary-50 bg-background-0 p-4"
              style={{
                shadowColor: "#0f172a",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.05,
                shadowRadius: 16,
                elevation: 2,
              }}
            >
              <Text className="text-sm text-typography-500">{stat.label}</Text>
              <Text className="mt-2 text-2xl font-bold text-typography-900">
                {stat.value}
              </Text>
            </Box>
          ))}
        </HStack>

        <VStack space="md">
          <Text className="text-lg font-bold text-typography-900">
            Quick actions
          </Text>
          {quickActions.map((action) => (
            <FeatureCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onPress={() => router.push(action.route as never)}
            />
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  );
}
