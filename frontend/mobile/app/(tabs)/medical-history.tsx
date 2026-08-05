import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchMedicalHistory, MedicalHistoryRecord } from "@/lib/enrolleeApi";
import { CalendarDays, FileHeart, Hospital, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, RefreshControl, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatDate(value?: string) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export default function MedicalHistory() {
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<MedicalHistoryRecord[]>([]);
  const [selected, setSelected] = useState<MedicalHistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError("");
    try {
      setRecords(await fetchMedicalHistory());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load medical history");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Health records"
        title="Medical history"
        description="A private timeline of care received through your plan."
      />
      <ScrollView
        contentContainerClassName="gap-4 px-5 py-5"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void load(true)} />}
      >
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && records.length === 0 ? (
          <Box className="items-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8">
            <FileHeart color="#64748b" size={30} />
            <Text className="mt-3 font-semibold text-typography-900">No medical records yet</Text>
            <Text className="mt-1 text-center text-sm text-typography-500">
              Completed services and diagnoses will be added here by your provider.
            </Text>
          </Box>
        ) : null}
        {records.map((record) => (
          <TouchableOpacity key={record.id} onPress={() => setSelected(record)} activeOpacity={0.8}>
            <Box className="rounded-[24px] border border-slate-100 bg-white p-5">
              <HStack className="items-start justify-between">
                <VStack className="mr-4 flex-1" space="sm">
                  <Text className="text-lg font-bold text-typography-900">
                    {record.Diagnosis?.name || record.serviceType || "Clinical visit"}
                  </Text>
                  <HStack className="items-center" space="xs">
                    <Hospital color="#64748b" size={15} />
                    <Text className="flex-1 text-sm text-typography-500">
                      {record.Provider?.name || "Healthcare provider"}
                    </Text>
                  </HStack>
                  <HStack className="items-center" space="xs">
                    <CalendarDays color="#64748b" size={15} />
                    <Text className="text-sm text-typography-500">{formatDate(record.serviceDate)}</Text>
                  </HStack>
                </VStack>
                {record.status ? (
                  <Box className="rounded-full bg-emerald-50 px-3 py-1">
                    <Text className="text-xs font-semibold capitalize text-emerald-700">{record.status}</Text>
                  </Box>
                ) : null}
              </HStack>
            </Box>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
            <HStack className="items-start justify-between">
              <VStack className="mr-4 flex-1" space="xs">
                <Text className="text-xs font-semibold uppercase tracking-widest text-primary-700">Record details</Text>
                <Text className="text-2xl font-bold text-typography-900">
                  {selected?.Diagnosis?.name || selected?.serviceType || "Clinical visit"}
                </Text>
              </VStack>
              <TouchableOpacity onPress={() => setSelected(null)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <VStack className="mt-6 rounded-[24px] bg-slate-50 p-5" space="md">
              <VStack space="xs">
                <Text className="text-xs font-semibold uppercase text-typography-400">Provider</Text>
                <Text className="font-semibold text-typography-800">{selected?.Provider?.name || "Not recorded"}</Text>
              </VStack>
              <VStack space="xs">
                <Text className="text-xs font-semibold uppercase text-typography-400">Service date</Text>
                <Text className="font-semibold text-typography-800">{formatDate(selected?.serviceDate)}</Text>
              </VStack>
              <VStack space="xs">
                <Text className="text-xs font-semibold uppercase text-typography-400">Clinical notes</Text>
                <Text className="text-sm leading-6 text-typography-600">
                  {selected?.notes || selected?.Diagnosis?.description || "No additional notes were recorded."}
                </Text>
              </VStack>
              {selected?.evsCode ? (
                <VStack space="xs">
                  <Text className="text-xs font-semibold uppercase text-typography-400">Authorization code</Text>
                  <Text className="font-semibold text-primary-800">{selected.evsCode}</Text>
                </VStack>
              ) : null}
            </VStack>
          </VStack>
        </Box>
      </Modal>
    </VStack>
  );
}
