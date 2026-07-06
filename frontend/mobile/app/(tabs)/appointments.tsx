import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Appointment, fetchAppointments } from "@/lib/enrolleeApi";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchAppointments()
      .then((data) => {
        if (isMounted) setAppointments(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Unable to load appointments");
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
        eyebrow="Care access"
        title="Appointments"
        description="Request and track enrollee appointments."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && appointments.length === 0 ? (
          <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
            <Text className="text-sm text-typography-500">
              No appointments found.
            </Text>
          </Box>
        ) : null}
        {appointments.map((appointment) => (
          <Box
            key={appointment.id}
            className="rounded-2xl border border-outline-100 bg-background-0 p-4"
          >
            <HStack className="items-start justify-between">
              <VStack className="mr-4 flex-1" space="xs">
                <Text className="font-semibold text-typography-900">
                  {appointment.complaint || "Appointment request"}
                </Text>
                <Text className="text-sm text-typography-500">
                  {appointment.Provider?.name || appointment.notes || "Provider pending"}
                </Text>
                <Text className="text-xs text-typography-400">
                  {appointment.appointmentDateTime || appointment.appointmentDate || ""}
                </Text>
              </VStack>
              <Box className="rounded-full bg-primary-50 px-3 py-1">
                <Text className="text-xs font-semibold text-primary-800">
                  {appointment.status || "pending"}
                </Text>
              </Box>
            </HStack>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
