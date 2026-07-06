import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Dependent, fetchDependents } from "@/lib/enrolleeApi";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function Dependents() {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchDependents()
      .then((data) => {
        if (isMounted) setDependents(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : "Unable to load dependents");
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
      <ScreenHeader eyebrow="Family" title="Dependents" description="View dependents attached to your plan." />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? <Text className="text-error-700">{error}</Text> : null}
        {!isLoading && !error && dependents.length === 0 ? (
          <Text className="text-typography-500">No dependents found.</Text>
        ) : null}
        {dependents.map((dependent) => (
          <Box key={dependent.id} className="rounded-2xl border border-outline-100 bg-background-0 p-4">
            <Text className="font-semibold text-typography-900">
              {[dependent.firstName, dependent.lastName].filter(Boolean).join(" ") || "Dependent"}
            </Text>
            <Text className="mt-1 text-sm text-typography-500">
              {dependent.relationshipToEnrollee || "Relationship not set"}
            </Text>
            <Text className="mt-2 text-xs text-primary-800">{dependent.status || "active"}</Text>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
