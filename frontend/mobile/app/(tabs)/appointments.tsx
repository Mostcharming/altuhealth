import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  Appointment,
  cancelAppointment,
  createAppointment,
  fetchAppointments,
  fetchProviders,
  Provider,
} from "@/lib/enrolleeApi";
import { CalendarPlus, Clock3, MapPin, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EMPTY_FORM = {
  providerId: "",
  appointmentDateTime: "",
  complaint: "",
  notes: "",
};

function formatDate(value?: string) {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
}

export default function Appointments() {
  const insets = useSafeAreaInsets();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError("");
    try {
      const [appointmentData, providerData] = await Promise.all([
        fetchAppointments(),
        fetchProviders(),
      ]);
      setAppointments(appointmentData);
      setProviders(providerData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load appointments");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    if (!form.providerId || !form.appointmentDateTime.trim()) {
      setError("Choose a provider and enter the appointment date and time.");
      return;
    }
    const parsedDate = new Date(form.appointmentDateTime.trim().replace(" ", "T"));
    if (Number.isNaN(parsedDate.getTime())) {
      setError("Use a valid date such as 2026-08-20 10:30.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await createAppointment({
        providerId: form.providerId,
        appointmentDateTime: parsedDate.toISOString(),
        complaint: form.complaint.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      setIsFormOpen(false);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = (appointment: Appointment) => {
    Alert.alert(
      "Cancel appointment?",
      "The provider will be notified that you cancelled this visit.",
      [
        { text: "Keep appointment", style: "cancel" },
        {
          text: "Cancel visit",
          style: "destructive",
          onPress: async () => {
            try {
              await cancelAppointment(appointment.id);
              await load(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to cancel appointment");
            }
          },
        },
      ]
    );
  };

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Care access"
        title="Appointments"
        description="Book a provider and keep every visit in one timeline."
      />
      <ScrollView
        contentContainerClassName="gap-4 px-5 py-5"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => void load(true)} />
        }
      >
        <TouchableOpacity
          onPress={() => setIsFormOpen(true)}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-4"
        >
          <CalendarPlus color="#ffffff" size={20} />
          <Text className="font-semibold text-white">Book an appointment</Text>
        </TouchableOpacity>

        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && appointments.length === 0 ? (
          <Box className="items-center rounded-[24px] border border-dashed border-outline-200 bg-white p-8">
            <CalendarPlus color="#64748b" size={28} />
            <Text className="mt-3 font-semibold text-typography-900">No visits yet</Text>
            <Text className="mt-1 text-center text-sm text-typography-500">
              Your upcoming and past appointments will appear here.
            </Text>
          </Box>
        ) : null}
        {appointments.map((appointment) => {
          const canCancel = ["pending", "approved", "rescheduled"].includes(
            String(appointment.status || "").toLowerCase()
          );
          return (
            <Box key={appointment.id} className="rounded-[24px] border border-slate-100 bg-white p-5">
              <HStack className="items-start justify-between">
                <VStack className="mr-4 flex-1" space="xs">
                  <Text className="text-lg font-bold text-typography-900">
                    {appointment.complaint || "General appointment"}
                  </Text>
                  <HStack className="items-center" space="xs">
                    <MapPin color="#64748b" size={14} />
                    <Text className="flex-1 text-sm text-typography-500">
                      {appointment.Provider?.name || "Provider pending"}
                    </Text>
                  </HStack>
                  <HStack className="items-center" space="xs">
                    <Clock3 color="#64748b" size={14} />
                    <Text className="text-sm text-typography-500">
                      {formatDate(appointment.appointmentDateTime || appointment.appointmentDate)}
                    </Text>
                  </HStack>
                </VStack>
                <Box className="rounded-full bg-primary-50 px-3 py-1">
                  <Text className="text-xs font-semibold capitalize text-primary-800">
                    {appointment.status || "pending"}
                  </Text>
                </Box>
              </HStack>
              {appointment.notes ? (
                <Text className="mt-4 text-sm leading-5 text-typography-600">{appointment.notes}</Text>
              ) : null}
              {canCancel ? (
                <TouchableOpacity onPress={() => handleCancel(appointment)} className="mt-4 self-start py-1">
                  <Text className="text-sm font-semibold text-error-700">Cancel appointment</Text>
                </TouchableOpacity>
              ) : null}
            </Box>
          );
        })}
      </ScrollView>

      <Modal visible={isFormOpen} animationType="slide" transparent onRequestClose={() => setIsFormOpen(false)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack
            className="max-h-[92%] rounded-t-[32px] bg-white px-5 pt-5"
            style={{ paddingBottom: Math.max(insets.bottom, 20) }}
          >
            <HStack className="items-center justify-between">
              <VStack>
                <Text className="text-xl font-bold text-typography-900">Book a visit</Text>
                <Text className="mt-1 text-sm text-typography-500">Select a provider and preferred time.</Text>
              </VStack>
              <TouchableOpacity onPress={() => setIsFormOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <ScrollView className="mt-5" contentContainerClassName="gap-4 pb-6">
              <VStack space="sm">
                <Text className="text-sm font-semibold text-typography-700">Provider</Text>
                {providers.length === 0 ? (
                  <Text className="text-sm text-typography-500">No active providers are available.</Text>
                ) : (
                  <HStack className="flex-wrap gap-2">
                    {providers.slice(0, 24).map((provider) => {
                      const selected = form.providerId === provider.id;
                      return (
                        <TouchableOpacity
                          key={provider.id}
                          onPress={() => setForm((value) => ({ ...value, providerId: provider.id }))}
                          className={`rounded-full border px-3 py-2 ${
                            selected ? "border-primary-700 bg-primary-50" : "border-slate-200 bg-white"
                          }`}
                        >
                          <Text className={`text-sm ${selected ? "font-semibold text-primary-800" : "text-typography-600"}`}>
                            {provider.name || "Provider"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </HStack>
                )}
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Date & time</Text>
                <TextInput
                  value={form.appointmentDateTime}
                  onChangeText={(appointmentDateTime) => setForm((value) => ({ ...value, appointmentDateTime }))}
                  placeholder="2026-08-20 10:30"
                  placeholderTextColor="#94a3b8"
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                />
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Reason for visit</Text>
                <TextInput
                  value={form.complaint}
                  onChangeText={(complaint) => setForm((value) => ({ ...value, complaint }))}
                  placeholder="Tell the provider what you need help with"
                  placeholderTextColor="#94a3b8"
                  multiline
                  className="min-h-24 rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                  textAlignVertical="top"
                />
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Additional notes</Text>
                <TextInput
                  value={form.notes}
                  onChangeText={(notes) => setForm((value) => ({ ...value, notes }))}
                  placeholder="Optional"
                  placeholderTextColor="#94a3b8"
                  multiline
                  className="min-h-20 rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                  textAlignVertical="top"
                />
              </VStack>
              <TouchableOpacity
                onPress={() => void handleCreate()}
                disabled={isSubmitting}
                className="items-center rounded-2xl bg-primary-700 py-4"
              >
                {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text className="font-semibold text-white">Send appointment request</Text>}
              </TouchableOpacity>
            </ScrollView>
          </VStack>
        </Box>
      </Modal>
    </VStack>
  );
}
