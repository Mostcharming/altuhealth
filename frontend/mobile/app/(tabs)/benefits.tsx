import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Benefit, fetchBenefits } from "@/lib/enrolleeApi";
import { Check, Search, ShieldCheck, X } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Benefits() {
  const insets = useSafeAreaInsets();
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [selected, setSelected] = useState<Benefit | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchBenefits()
      .then((data) => isMounted && setBenefits(data))
      .catch((err) => isMounted && setError(err instanceof Error ? err.message : "Unable to load benefits"))
      .finally(() => isMounted && setIsLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredBenefits = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return benefits;
    return benefits.filter((benefit) =>
      [benefit.name, benefit.description, benefit.benefitCategory]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalized))
    );
  }, [benefits, query]);

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Plan cover"
        title="Benefits"
        description="Know what is covered before you visit a provider."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5" keyboardShouldPersistTaps="handled">
        <HStack className="items-center rounded-2xl border border-slate-200 bg-white px-4">
          <Search color="#64748b" size={18} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search benefits"
            placeholderTextColor="#94a3b8"
            className="flex-1 px-3 py-4 text-typography-900"
          />
        </HStack>
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && filteredBenefits.length === 0 ? (
          <Box className="items-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8">
            <ShieldCheck color="#64748b" size={28} />
            <Text className="mt-3 font-semibold text-typography-900">No matching benefits</Text>
            <Text className="mt-1 text-center text-sm text-typography-500">
              Try another search or contact support about your plan cover.
            </Text>
          </Box>
        ) : null}
        {filteredBenefits.map((benefit) => (
          <TouchableOpacity key={benefit.id} onPress={() => setSelected(benefit)} activeOpacity={0.8}>
            <HStack className="items-center rounded-[24px] border border-slate-100 bg-white p-5">
              <Box className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                <Check color="#047857" size={19} />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="font-bold text-typography-900">{benefit.name || "Benefit"}</Text>
                <Text className="text-sm text-typography-500">
                  {benefit.benefitCategory || benefit.description || "Covered benefit"}
                </Text>
                {benefit.coverageValue ? (
                  <Text className="text-xs font-semibold text-primary-800">
                    {benefit.coverageType ? `${benefit.coverageType}: ` : ""}{String(benefit.coverageValue)}
                  </Text>
                ) : null}
              </VStack>
            </HStack>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
            <HStack className="items-start justify-between">
              <VStack className="mr-4 flex-1" space="xs">
                <Text className="text-xs font-semibold uppercase tracking-widest text-primary-700">Benefit details</Text>
                <Text className="text-2xl font-bold text-typography-900">{selected?.name || "Benefit"}</Text>
              </VStack>
              <TouchableOpacity onPress={() => setSelected(null)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <VStack className="mt-6 rounded-[24px] bg-slate-50 p-5" space="md">
              <VStack space="xs">
                <Text className="text-xs font-semibold uppercase text-typography-400">Category</Text>
                <Text className="font-semibold text-typography-800">{selected?.benefitCategory || "General cover"}</Text>
              </VStack>
              <VStack space="xs">
                <Text className="text-xs font-semibold uppercase text-typography-400">Description</Text>
                <Text className="text-sm leading-6 text-typography-600">{selected?.description || "This service is included in your health plan."}</Text>
              </VStack>
              <VStack space="xs">
                <Text className="text-xs font-semibold uppercase text-typography-400">Coverage</Text>
                <Text className="font-semibold text-emerald-700">
                  {selected?.coverageValue
                    ? `${selected.coverageType || "Covered"}: ${selected.coverageValue}`
                    : selected?.isCovered === false
                      ? "Not covered"
                      : "Covered"}
                </Text>
              </VStack>
            </VStack>
          </VStack>
        </Box>
      </Modal>
    </VStack>
  );
}
