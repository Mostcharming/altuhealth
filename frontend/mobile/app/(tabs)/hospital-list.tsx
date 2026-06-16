import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchProviders, Provider } from "@/lib/enrolleeApi";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function HospitalList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchProviders()
      .then((data) => {
        if (isMounted) setProviders(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : "Unable to load providers");
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
      <ScreenHeader eyebrow="Care network" title="Hospital list" description="Approved healthcare providers and medical centers." />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? <Text className="text-error-700">{error}</Text> : null}
        {providers.map((provider) => (
          <Box key={provider.id} className="rounded-2xl border border-outline-100 bg-background-0 p-4">
            <Text className="font-semibold text-typography-900">{provider.name || "Provider"}</Text>
            <Text className="mt-1 text-sm text-typography-500">
              {[provider.state, provider.lga].filter(Boolean).join(", ") || provider.address || "Location unavailable"}
            </Text>
            <Text className="mt-2 text-xs text-primary-800">{provider.category || "Healthcare provider"}</Text>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
