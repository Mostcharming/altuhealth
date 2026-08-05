import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  addTicketMessage,
  createTicket,
  fetchTickets,
  getTicket,
  Ticket,
} from "@/lib/enrolleeApi";
import { router } from "expo-router";
import { MessageCircle, Plus, Send, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const EMPTY_FORM = { subject: "", description: "", category: "general", priority: "medium" };

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function SupportMessages() {
  const insets = useSafeAreaInsets();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [reply, setReply] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    refresh ? setIsRefreshing(true) : setIsLoading(true);
    setError("");
    try {
      setTickets(await fetchTickets());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load support messages");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openTicket = async (ticket: Ticket) => {
    setSelected(ticket);
    setIsLoadingTicket(true);
    setError("");
    try {
      setSelected(await getTicket(ticket.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open this ticket");
    } finally {
      setIsLoadingTicket(false);
    }
  };

  const handleCreate = async () => {
    if (!form.subject.trim()) {
      setError("Add a subject so support knows how to help.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await createTicket({
        subject: form.subject.trim(),
        description: form.description.trim() || undefined,
        category: form.category,
        priority: form.priority,
      });
      setForm(EMPTY_FORM);
      setIsCreateOpen(false);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create ticket");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReply = async () => {
    if (!selected || !reply.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      await addTicketMessage(selected.id, reply.trim());
      setReply("");
      setSelected(await getTicket(selected.id));
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reply");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Member support"
        title="Support messages"
        description="Start a request and keep the conversation in one place."
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerClassName="gap-4 px-5 py-5"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void load(true)} />}
      >
        <TouchableOpacity onPress={() => { setError(""); setIsCreateOpen(true); }} className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-4">
          <Plus color="#ffffff" size={20} />
          <Text className="font-semibold text-white">New support request</Text>
        </TouchableOpacity>
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error && !isCreateOpen && !selected ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && tickets.length === 0 ? (
          <Box className="items-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8">
            <MessageCircle color="#64748b" size={30} />
            <Text className="mt-3 font-semibold text-typography-900">No support requests</Text>
            <Text className="mt-1 text-center text-sm text-typography-500">When you need help, start a request here and follow every reply.</Text>
          </Box>
        ) : null}
        {tickets.map((ticket) => (
          <TouchableOpacity key={ticket.id} onPress={() => void openTicket(ticket)} activeOpacity={0.8}>
            <Box className="rounded-[24px] border border-slate-100 bg-white p-5">
              <HStack className="items-start justify-between">
                <VStack className="mr-4 flex-1" space="xs">
                  <Text className="text-lg font-bold text-typography-900">{ticket.subject || "Support request"}</Text>
                  <Text className="text-sm capitalize text-typography-500">
                    #{ticket.ticketNumber || "—"} · {ticket.category || "general"}
                  </Text>
                  <Text className="text-xs text-typography-400">{formatDate(ticket.createdAt)}</Text>
                </VStack>
                <Box className="rounded-full bg-primary-50 px-3 py-1">
                  <Text className="text-xs font-semibold capitalize text-primary-800">{String(ticket.status || "pending").replace("_", " ")}</Text>
                </Box>
              </HStack>
            </Box>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="h-[88%] rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <HStack className="items-start justify-between">
              <VStack className="mr-4 flex-1" space="xs">
                <Text className="text-xs font-semibold uppercase tracking-widest text-primary-700">Ticket #{selected?.ticketNumber || "—"}</Text>
                <Text className="text-xl font-bold text-typography-900">{selected?.subject}</Text>
              </VStack>
              <TouchableOpacity onPress={() => setSelected(null)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            {error ? (
              <Box className="mt-4 rounded-2xl border border-error-200 bg-error-50 p-3">
                <Text className="text-sm text-error-700">{error}</Text>
              </Box>
            ) : null}
            <ScrollView className="mt-4 flex-1" contentContainerClassName="gap-3 pb-4">
              {isLoadingTicket ? <ActivityIndicator color="#1e63e9" /> : null}
              {selected?.description ? (
                <Box className="self-end rounded-[20px] rounded-br-md bg-primary-700 p-4">
                  <Text className="text-sm leading-5 text-white">{selected.description}</Text>
                </Box>
              ) : null}
              {(selected?.messages || []).map((message) => {
                const isMember = ["Enrollee", "RetailEnrollee"].includes(message.senderType || "");
                return (
                  <Box key={message.id} className={`max-w-[88%] rounded-[20px] p-4 ${isMember ? "self-end rounded-br-md bg-primary-700" : "self-start rounded-bl-md bg-slate-100"}`}>
                    <Text className={`text-sm leading-5 ${isMember ? "text-white" : "text-typography-800"}`}>{message.content || "Attachment"}</Text>
                    <Text className={`mt-2 text-[11px] ${isMember ? "text-primary-100" : "text-typography-400"}`}>{message.senderType || "Support"} · {formatDate(message.createdAt)}</Text>
                  </Box>
                );
              })}
            </ScrollView>
            <HStack className="items-end rounded-[22px] border border-slate-200 bg-slate-50 p-2">
              <TextInput
                value={reply}
                onChangeText={setReply}
                placeholder="Write a reply"
                placeholderTextColor="#94a3b8"
                multiline
                className="max-h-28 flex-1 px-3 py-2 text-typography-900"
              />
              <TouchableOpacity onPress={() => void handleReply()} disabled={isSaving || !reply.trim()} className="h-11 w-11 items-center justify-center rounded-2xl bg-primary-700">
                {isSaving ? <ActivityIndicator color="#ffffff" size="small" /> : <Send color="#ffffff" size={18} />}
              </TouchableOpacity>
            </HStack>
          </VStack>
        </Box>
      </Modal>

      <Modal visible={isCreateOpen} transparent animationType="slide" onRequestClose={() => setIsCreateOpen(false)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="max-h-[90%] rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <HStack className="items-center justify-between">
              <VStack>
                <Text className="text-xl font-bold text-typography-900">New support request</Text>
                <Text className="mt-1 text-sm text-typography-500">Tell us what happened and how urgent it is.</Text>
              </VStack>
              <TouchableOpacity onPress={() => setIsCreateOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <ScrollView className="mt-5" contentContainerClassName="gap-4 pb-6" keyboardShouldPersistTaps="handled">
              {error ? (
                <Box className="rounded-2xl border border-error-200 bg-error-50 p-3">
                  <Text className="text-sm text-error-700">{error}</Text>
                </Box>
              ) : null}
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Subject</Text>
                <TextInput value={form.subject} onChangeText={(subject) => setForm((value) => ({ ...value, subject }))} placeholder="What do you need help with?" placeholderTextColor="#94a3b8" className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900" />
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Category</Text>
                <HStack className="flex-wrap gap-2">
                  {["general", "billing", "claim", "provider", "appointment", "enrollment"].map((category) => (
                    <TouchableOpacity key={category} onPress={() => setForm((value) => ({ ...value, category }))} className={`rounded-full border px-4 py-3 ${form.category === category ? "border-primary-700 bg-primary-50" : "border-slate-200"}`}>
                      <Text className={`capitalize ${form.category === category ? "font-semibold text-primary-800" : "text-typography-600"}`}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Priority</Text>
                <HStack className="gap-2">
                  {["low", "medium", "high", "urgent"].map((priority) => (
                    <TouchableOpacity key={priority} onPress={() => setForm((value) => ({ ...value, priority }))} className={`flex-1 items-center rounded-full border py-3 ${form.priority === priority ? "border-primary-700 bg-primary-50" : "border-slate-200"}`}>
                      <Text className={`text-xs capitalize ${form.priority === priority ? "font-semibold text-primary-800" : "text-typography-600"}`}>{priority}</Text>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Description</Text>
                <TextInput value={form.description} onChangeText={(description) => setForm((value) => ({ ...value, description }))} placeholder="Describe your request" placeholderTextColor="#94a3b8" multiline textAlignVertical="top" className="min-h-28 rounded-2xl border border-slate-200 px-4 py-4 text-typography-900" />
              </VStack>
              <TouchableOpacity onPress={() => void handleCreate()} disabled={isSaving} className="items-center rounded-2xl bg-primary-700 py-4">
                {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text className="font-semibold text-white">Create request</Text>}
              </TouchableOpacity>
            </ScrollView>
          </VStack>
        </Box>
      </Modal>
    </VStack>
  );
}
