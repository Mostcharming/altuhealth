import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchPeriodTracker, PeriodTracker } from "@/lib/enrolleeApi";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function WomensHealth() {
  const [tracker, setTracker] = useState<PeriodTracker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchPeriodTracker()
      .then((data) => {
        if (isMounted) setTracker(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : "Unable to load tracker");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader eyebrow="Women's health" title="Tracker" description="View your women's health tracker details." />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? <Text className="text-error-700">{error}</Text> : null}
        <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
          <Text className="text-sm text-typography-500">Last period start</Text>
          <Text className="mt-2 font-semibold text-typography-900">
            {tracker?.lastPeriodStartDate || "Not recorded"}
          </Text>
        </Box>
        <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
          <Text className="text-sm text-typography-500">Cycle length</Text>
          <Text className="mt-2 font-semibold text-typography-900">
            {tracker?.cycleLength ? `${tracker.cycleLength} days` : "Not recorded"}
          </Text>
        </Box>
      </ScrollView>
    </VStack>
  );
}
