import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchProviders, Provider } from "@/lib/enrolleeApi";
import { router } from "expo-router";
import { Hospital, MapPin, Phone, Search } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, TextInput, TouchableOpacity } from "react-native";

export default function HospitalList() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchProviders()
      .then((data) => isMounted && setProviders(data))
      .catch((err) => isMounted && setError(err instanceof Error ? err.message : "Unable to load providers"))
      .finally(() => isMounted && setIsLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleProviders = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return providers;
    return providers.filter((provider) =>
      [provider.name, provider.state, provider.lga, provider.address, provider.type, provider.categoryLabel]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [providers, query]);

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Care network"
        title="Hospital list"
        description="Find an approved facility close to home or work."
        onBack={() => router.back()}
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5" keyboardShouldPersistTaps="handled">
        <HStack className="items-center rounded-2xl border border-slate-200 bg-white px-4">
          <Search color="#64748b" size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search hospital, state, or area"
            placeholderTextColor="#94a3b8"
            className="flex-1 px-3 py-4 text-typography-900"
          />
        </HStack>
        <Text className="text-sm text-typography-500">
          {visibleProviders.length} approved {visibleProviders.length === 1 ? "provider" : "providers"}
        </Text>
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && visibleProviders.length === 0 ? (
          <Box className="items-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8">
            <Hospital color="#64748b" size={30} />
            <Text className="mt-3 font-semibold text-typography-900">No provider found</Text>
            <Text className="mt-1 text-center text-sm text-typography-500">Try a broader location or provider name.</Text>
          </Box>
        ) : null}
        {visibleProviders.map((provider) => (
          <Box key={provider.id} className="rounded-[24px] border border-slate-100 bg-white p-5">
            <HStack className="items-start" space="md">
              <Box className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                <Hospital color="#1d4ed8" size={22} />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="text-lg font-bold text-typography-900">{provider.name || "Provider"}</Text>
                <Text className="text-xs font-semibold text-primary-800">
                  {provider.specialization?.name || provider.type || provider.categoryLabel || provider.category || "Healthcare provider"}
                </Text>
                <HStack className="mt-2 items-start" space="xs">
                  <MapPin color="#64748b" size={15} />
                  <Text className="flex-1 text-sm leading-5 text-typography-500">
                    {provider.address || [provider.lga, provider.state].filter(Boolean).join(", ") || "Location unavailable"}
                  </Text>
                </HStack>
                {provider.phoneNumber ? (
                  <TouchableOpacity
                    onPress={() => void Linking.openURL(`tel:${provider.phoneNumber}`)}
                    className="mt-3 flex-row items-center self-start rounded-full bg-primary-50 px-4 py-2"
                  >
                    <Phone color="#1d4ed8" size={15} />
                    <Text className="ml-2 text-sm font-semibold text-primary-800">Call provider</Text>
                  </TouchableOpacity>
                ) : null}
              </VStack>
            </HStack>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
