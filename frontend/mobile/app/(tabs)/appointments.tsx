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
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { CalendarDays, CalendarPlus, Check, Clock3, MapPin, Search, X } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EMPTY_FORM = {
  providerId: "",
  complaint: "",
  notes: "",
};

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromSelection(dateKey: string, time: Date) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, time.getHours(), time.getMinutes(), 0, 0);
}

function defaultTimeForDate(dateKey: string) {
  const now = new Date();
  if (dateKey !== toDateKey(now)) {
    const morning = new Date();
    morning.setHours(9, 0, 0, 0);
    return morning;
  }

  const nextTime = new Date(now);
  nextTime.setSeconds(0, 0);
  nextTime.setMinutes(Math.ceil((nextTime.getMinutes() + 1) / 15) * 15);
  return nextTime;
}

function formatSelectedDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function providerDetails(provider: Provider) {
  const service =
    provider.specialization?.name || provider.categoryLabel || provider.category || provider.type;
  const location = [provider.lga, provider.state].filter(Boolean).join(", ");
  return [service, location].filter(Boolean).join(" · ");
}

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
  const [providerQuery, setProviderQuery] = useState("");
  const [showProviderResults, setShowProviderResults] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [draftTime, setDraftTime] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [error, setError] = useState("");

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === form.providerId),
    [form.providerId, providers]
  );
  const normalizedProviderQuery = providerQuery.trim().toLowerCase();
  const matchingProviders = useMemo(() => {
    if (!normalizedProviderQuery) return [];

    return providers
      .filter((provider) =>
        [
          provider.name,
          provider.specialization?.name,
          provider.categoryLabel,
          provider.category,
          provider.type,
          provider.address,
          provider.lga,
          provider.state,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedProviderQuery))
      )
      .slice(0, 25);
  }, [normalizedProviderQuery, providers]);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
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
    if (!form.providerId || !selectedDate || !selectedTime) {
      setError("Choose a provider, date, and time for your appointment.");
      return;
    }

    const appointmentDateTime = dateFromSelection(selectedDate, selectedTime);
    if (appointmentDateTime.getTime() <= Date.now()) {
      setError("Choose a future date and time for your appointment.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await createAppointment({
        providerId: form.providerId,
        appointmentDateTime: appointmentDateTime.toISOString(),
        complaint: form.complaint.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setForm(EMPTY_FORM);
      setProviderQuery("");
      setShowProviderResults(false);
      setSelectedDate("");
      setSelectedTime(null);
      setIsCalendarOpen(false);
      setIsTimePickerOpen(false);
      setIsFormOpen(false);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to book appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectProvider = (provider: Provider, fromSearch = false) => {
    setForm((value) => ({ ...value, providerId: provider.id }));
    if (fromSearch) setProviderQuery(provider.name || "Provider");
    setShowProviderResults(false);
    setError("");
  };

  const selectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setIsCalendarOpen(false);
    if (selectedTime && dateFromSelection(dateString, selectedTime).getTime() <= Date.now()) {
      setSelectedTime(null);
    }
    setError("");
  };

  const openTimePicker = () => {
    if (!selectedDate) {
      setError("Choose an appointment date before selecting a time.");
      setIsCalendarOpen(true);
      return;
    }
    setDraftTime(selectedTime || defaultTimeForDate(selectedDate));
    setIsTimePickerOpen(true);
    setError("");
  };

  const commitTime = (time: Date) => {
    if (dateFromSelection(selectedDate, time).getTime() <= Date.now()) {
      setError("That time has passed. Choose a future appointment time.");
      return false;
    }
    setSelectedTime(time);
    setError("");
    return true;
  };

  const handleTimeChange = (event: DateTimePickerEvent, value?: Date) => {
    if (Platform.OS === "android") {
      setIsTimePickerOpen(false);
      if (event.type === "set" && value) commitTime(value);
      return;
    }

    if (value) setDraftTime(value);
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
          onPress={() => {
            setError("");
            setIsFormOpen(true);
          }}
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
              {error ? (
                <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
                  <Text className="text-sm text-error-700">{error}</Text>
                </Box>
              ) : null}
              <VStack space="sm">
                <Text className="text-sm font-semibold text-typography-700">Provider</Text>
                {providers.length === 0 ? (
                  <Text className="text-sm text-typography-500">No active providers are available.</Text>
                ) : (
                  <VStack space="sm">
                    <HStack className="items-center rounded-2xl border border-slate-200 bg-white px-4">
                      <Search color="#64748b" size={18} />
                      <TextInput
                        value={providerQuery}
                        onChangeText={(query) => {
                          setProviderQuery(query);
                          setShowProviderResults(Boolean(query.trim()));
                          if (form.providerId) {
                            setForm((value) => ({ ...value, providerId: "" }));
                          }
                        }}
                        onFocus={() => setShowProviderResults(Boolean(providerQuery.trim()))}
                        placeholder="Search provider, specialty, or location"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        autoCorrect={false}
                        className="flex-1 py-4 pl-3 text-typography-900"
                      />
                      {providerQuery ? (
                        <TouchableOpacity
                          accessibilityLabel="Clear provider search"
                          onPress={() => {
                            setProviderQuery("");
                            setShowProviderResults(false);
                            setForm((value) => ({ ...value, providerId: "" }));
                          }}
                          className="h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                        >
                          <X color="#64748b" size={16} />
                        </TouchableOpacity>
                      ) : null}
                    </HStack>

                    {showProviderResults && normalizedProviderQuery ? (
                      matchingProviders.length > 0 ? (
                        <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          {matchingProviders.map((provider, index) => (
                            <TouchableOpacity
                              key={provider.id}
                              onPress={() => selectProvider(provider, true)}
                              className={`flex-row items-center px-4 py-3 ${
                                index < matchingProviders.length - 1 ? "border-b border-slate-100" : ""
                              }`}
                            >
                              <VStack className="mr-3 flex-1" space="xs">
                                <Text className="font-semibold text-typography-900">
                                  {provider.name || "Provider"}
                                </Text>
                                {providerDetails(provider) ? (
                                  <Text className="text-xs text-typography-500">{providerDetails(provider)}</Text>
                                ) : null}
                              </VStack>
                              {form.providerId === provider.id ? <Check color="#1e63e9" size={18} /> : null}
                            </TouchableOpacity>
                          ))}
                        </Box>
                      ) : (
                        <Box className="rounded-2xl border border-dashed border-slate-200 p-4">
                          <Text className="text-center text-sm text-typography-500">
                            No providers match “{providerQuery.trim()}”.
                          </Text>
                        </Box>
                      )
                    ) : null}

                    {selectedProvider && providerQuery ? (
                      <HStack className="items-center justify-between rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3">
                        <VStack className="mr-3 flex-1" space="xs">
                          <Text className="text-xs font-semibold uppercase tracking-wide text-primary-700">
                            Selected provider
                          </Text>
                          <Text className="font-semibold text-primary-900">
                            {selectedProvider.name || "Provider"}
                          </Text>
                        </VStack>
                        <Check color="#1e63e9" size={20} />
                      </HStack>
                    ) : null}

                    {!normalizedProviderQuery ? (
                      <VStack space="xs">
                        <Text className="text-xs text-typography-500">Quick picks</Text>
                        <HStack className="flex-wrap gap-2">
                          {providers.slice(0, 10).map((provider) => {
                            const selected = form.providerId === provider.id;
                            return (
                              <TouchableOpacity
                                key={provider.id}
                                onPress={() => selectProvider(provider)}
                                className={`rounded-full border px-3 py-2 ${
                                  selected
                                    ? "border-primary-700 bg-primary-50"
                                    : "border-slate-200 bg-white"
                                }`}
                              >
                                <Text
                                  className={`text-sm ${
                                    selected
                                      ? "font-semibold text-primary-800"
                                      : "text-typography-600"
                                  }`}
                                >
                                  {provider.name || "Provider"}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </HStack>
                      </VStack>
                    ) : null}
                  </VStack>
                )}
              </VStack>
              <VStack space="sm">
                <Text className="text-sm font-semibold text-typography-700">Date & time</Text>
                <HStack className="gap-3">
                  <TouchableOpacity
                    onPress={() => {
                      setIsCalendarOpen((value) => !value);
                      setIsTimePickerOpen(false);
                      setError("");
                    }}
                    className={`flex-1 flex-row items-center rounded-2xl border px-4 py-4 ${
                      selectedDate ? "border-primary-200 bg-primary-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <CalendarDays color={selectedDate ? "#1e63e9" : "#64748b"} size={20} />
                    <VStack className="ml-3 flex-1" space="xs">
                      <Text className="text-xs text-typography-500">Date</Text>
                      <Text className={`text-sm font-semibold ${selectedDate ? "text-primary-900" : "text-typography-700"}`}>
                        {selectedDate ? formatSelectedDate(selectedDate) : "Choose date"}
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={openTimePicker}
                    className={`flex-1 flex-row items-center rounded-2xl border px-4 py-4 ${
                      selectedTime ? "border-primary-200 bg-primary-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <Clock3 color={selectedTime ? "#1e63e9" : "#64748b"} size={20} />
                    <VStack className="ml-3 flex-1" space="xs">
                      <Text className="text-xs text-typography-500">Time</Text>
                      <Text className={`text-sm font-semibold ${selectedTime ? "text-primary-900" : "text-typography-700"}`}>
                        {selectedTime
                          ? selectedTime.toLocaleTimeString("en-NG", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Choose time"}
                      </Text>
                    </VStack>
                  </TouchableOpacity>
                </HStack>

                {isCalendarOpen ? (
                  <Box className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2">
                    <Calendar
                      minDate={toDateKey(new Date())}
                      onDayPress={(day) => selectDate(day.dateString)}
                      markedDates={
                        selectedDate
                          ? {
                              [selectedDate]: {
                                selected: true,
                                selectedColor: "#1e63e9",
                                selectedTextColor: "#ffffff",
                              },
                            }
                          : undefined
                      }
                      enableSwipeMonths
                      theme={{
                        arrowColor: "#1e63e9",
                        todayTextColor: "#1e63e9",
                        textDayFontWeight: "500",
                        textMonthFontWeight: "700",
                        textDayHeaderFontWeight: "600",
                      }}
                    />
                    <Text className="px-3 pb-2 text-xs text-typography-500">
                      Past dates are unavailable. Today is allowed only with a future time.
                    </Text>
                  </Box>
                ) : null}

                {isTimePickerOpen ? (
                  <Box className="rounded-2xl border border-slate-200 bg-white p-3">
                    <DateTimePicker
                      value={draftTime}
                      mode="time"
                      display={Platform.OS === "ios" ? "spinner" : "default"}
                      minuteInterval={5}
                      onChange={handleTimeChange}
                    />
                    {Platform.OS === "ios" ? (
                      <HStack className="mt-2 justify-end gap-2">
                        <TouchableOpacity
                          onPress={() => setIsTimePickerOpen(false)}
                          className="rounded-xl px-4 py-2"
                        >
                          <Text className="font-semibold text-typography-600">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => {
                            if (commitTime(draftTime)) setIsTimePickerOpen(false);
                          }}
                          className="rounded-xl bg-primary-700 px-4 py-2"
                        >
                          <Text className="font-semibold text-white">Use this time</Text>
                        </TouchableOpacity>
                      </HStack>
                    ) : null}
                  </Box>
                ) : null}
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
