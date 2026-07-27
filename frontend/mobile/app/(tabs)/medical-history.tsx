import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  fetchMedicalHistory,
  MedicalHistoryRecord,
} from "@/lib/enrolleeApi";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function MedicalHistory() {
  const [records, setRecords] = useState<MedicalHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchMedicalHistory()
      .then((data) => {
        if (isMounted) setRecords(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load medical history"
          );
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
        eyebrow="Health records"
        title="Medical history"
        description="A mobile view of the enrollee medical profile and clinical notes."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && records.length === 0 ? (
          <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
            <Text className="text-sm text-typography-500">
              No medical history records found.
            </Text>
          </Box>
        ) : null}
        {records.map((record) => (
          <Box
            key={record.id}
            className="rounded-2xl border border-outline-100 bg-background-0 p-4"
          >
            <Text className="text-sm text-typography-500">
              {record.Provider?.name || "Medical record"}
            </Text>
            <Text className="mt-2 font-semibold text-typography-900">
              {record.Diagnosis?.name || record.notes || "Clinical visit"}
            </Text>
            <Text className="mt-2 text-xs text-typography-400">
              {record.serviceDate || record.evsCode || record.status || ""}
            </Text>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
