import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  fetchPeriodEvents,
  fetchPeriodTracker,
  PeriodTracker,
  savePeriodTracker,
} from "@/lib/enrolleeApi";
import { router } from "expo-router";
import { CalendarHeart, Pencil } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, TextInput, TouchableOpacity } from "react-native";

export default function WomensHealth() {
  const [tracker, setTracker] = useState<PeriodTracker | null>(null);
  const [events, setEvents] = useState<Array<{ id: string; title: string; start: string; end?: string }>>([]);
  const [lastPeriodDate, setLastPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [periodDuration, setPeriodDuration] = useState("5");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchPeriodTracker(), fetchPeriodEvents()])
      .then(([trackerData, eventData]) => {
        if (!isMounted) return;
        setTracker(trackerData);
        setEvents(eventData || []);
        if (trackerData) {
          setLastPeriodDate(trackerData.lastPeriodDate?.slice(0, 10) || "");
          setCycleLength(String(trackerData.cycleLength || 28));
          setPeriodDuration(String(trackerData.periodDuration || 5));
        } else {
          setIsEditing(true);
        }
      })
      .catch((err) => isMounted && setError(err instanceof Error ? err.message : "Unable to load tracker"))
      .finally(() => isMounted && setIsLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    const cycle = Number(cycleLength);
    const duration = Number(periodDuration);
    if (!lastPeriodDate || Number.isNaN(new Date(lastPeriodDate).getTime())) {
      setError("Enter the last period date as YYYY-MM-DD.");
      return;
    }
    if (cycle < 15 || cycle > 60 || duration < 1 || duration > 14) {
      setError("Cycle length must be 15–60 days and period length 1–14 days.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const saved = await savePeriodTracker(
        { lastPeriodDate, cycleLength: cycle, periodDuration: duration },
        Boolean(tracker)
      );
      setTracker(saved);
      setEvents(await fetchPeriodEvents());
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save tracker");
    } finally {
      setIsSaving(false);
    }
  };

  const nextEvents = events
    .filter((event) => new Date(event.start).getTime() >= new Date().setHours(0, 0, 0, 0))
    .slice(0, 4);

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Women's health"
        title="Cycle tracker"
        description="Record your cycle and see helpful date predictions."
        onBack={() => router.back()}
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5" keyboardShouldPersistTaps="handled">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {isEditing ? (
          <VStack className="rounded-[28px] border border-rose-100 bg-white p-5" space="md">
            <HStack className="items-center" space="sm">
              <Box className="h-11 w-11 items-center justify-center rounded-2xl bg-rose-50">
                <CalendarHeart color="#be185d" size={21} />
              </Box>
              <VStack className="flex-1">
                <Text className="text-lg font-bold text-typography-900">{tracker ? "Update cycle" : "Set up tracker"}</Text>
                <Text className="text-sm text-typography-500">Your entries stay in your health account.</Text>
              </VStack>
            </HStack>
            <VStack space="xs">
              <Text className="text-sm font-semibold text-typography-700">Last period start</Text>
              <TextInput value={lastPeriodDate} onChangeText={setLastPeriodDate} placeholder="2026-08-01" placeholderTextColor="#94a3b8" className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900" />
            </VStack>
            <HStack className="gap-3">
              <VStack className="flex-1" space="xs">
                <Text className="text-sm font-semibold text-typography-700">Cycle days</Text>
                <TextInput value={cycleLength} onChangeText={setCycleLength} keyboardType="number-pad" className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900" />
              </VStack>
              <VStack className="flex-1" space="xs">
                <Text className="text-sm font-semibold text-typography-700">Period days</Text>
                <TextInput value={periodDuration} onChangeText={setPeriodDuration} keyboardType="number-pad" className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900" />
              </VStack>
            </HStack>
            <HStack className="gap-3">
              {tracker ? (
                <TouchableOpacity onPress={() => setIsEditing(false)} className="flex-1 items-center rounded-2xl border border-slate-200 py-4">
                  <Text className="font-semibold text-typography-700">Cancel</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity onPress={() => void handleSave()} disabled={isSaving} className="flex-1 items-center rounded-2xl bg-rose-600 py-4">
                {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text className="font-semibold text-white">Save tracker</Text>}
              </TouchableOpacity>
            </HStack>
          </VStack>
        ) : tracker ? (
          <>
            <Box className="overflow-hidden rounded-[28px] bg-rose-600 p-5">
              <Box className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10" />
              <HStack className="items-start justify-between">
                <VStack space="xs">
                  <Text className="text-sm font-semibold text-rose-100">Last period started</Text>
                  <Text className="text-3xl font-bold text-white">{tracker.lastPeriodDate?.slice(0, 10) || "Not recorded"}</Text>
                  <Text className="mt-2 text-sm text-rose-100">{tracker.cycleLength || 28}-day cycle · {tracker.periodDuration || 5}-day period</Text>
                </VStack>
                <TouchableOpacity onPress={() => setIsEditing(true)} className="h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <Pencil color="#ffffff" size={18} />
                </TouchableOpacity>
              </HStack>
            </Box>
            <Text className="mt-2 text-lg font-bold text-typography-900">Upcoming predictions</Text>
            {nextEvents.length === 0 ? (
              <Box className="rounded-2xl bg-white p-5">
                <Text className="text-sm text-typography-500">No upcoming predictions are available yet.</Text>
              </Box>
            ) : null}
            {nextEvents.map((event) => (
              <HStack key={event.id} className="items-center rounded-2xl border border-slate-100 bg-white p-4">
                <Box className={`mr-3 h-10 w-10 rounded-full ${event.title === "Period" ? "bg-rose-100" : event.title === "Ovulation" ? "bg-primary-100" : "bg-emerald-100"}`} />
                <VStack className="flex-1">
                  <Text className="font-semibold text-typography-900">{event.title}</Text>
                  <Text className="text-sm text-typography-500">{event.start}{event.end ? ` – ${event.end}` : ""}</Text>
                </VStack>
              </HStack>
            ))}
          </>
        ) : null}
        <Box className="rounded-2xl bg-slate-100 p-4">
          <Text className="text-xs leading-5 text-typography-500">
            Predictions are estimates and are not medical advice or birth-control guidance. Speak with a clinician about health concerns.
          </Text>
        </Box>
      </ScrollView>
    </VStack>
  );
}
