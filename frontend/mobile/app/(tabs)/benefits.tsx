import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Benefit, fetchBenefits } from "@/lib/enrolleeApi";
import { Check } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function Benefits() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchBenefits()
      .then((data) => {
        if (isMounted) setBenefits(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load benefits");
        }
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
      <ScreenHeader
        eyebrow="Plan cover"
        title="Benefits"
        description="Review the key services available to this enrollee."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && benefits.length === 0 ? (
          <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
            <Text className="text-sm text-typography-500">
              No benefits found for this plan.
            </Text>
          </Box>
        ) : null}
        {benefits.map((benefit) => (
          <HStack
            key={benefit.id}
            className="items-center rounded-2xl border border-outline-100 bg-background-0 p-4"
          >
            <Box className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-success-50">
              <Check color="#166534" size={18} />
            </Box>
            <VStack className="flex-1" space="xs">
              <Text className="font-semibold text-typography-900">
                {benefit.name || "Benefit"}
              </Text>
              <Text className="text-sm text-typography-500">
                {benefit.description || benefit.benefitCategory || "Covered benefit"}
              </Text>
            </VStack>
          </HStack>
        ))}
      </ScrollView>
    </VStack>
  );
}
