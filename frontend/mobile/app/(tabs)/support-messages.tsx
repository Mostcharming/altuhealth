import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchTickets, Ticket } from "@/lib/enrolleeApi";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

export default function SupportMessages() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchTickets()
      .then((data) => {
        if (isMounted) setTickets(data);
      })
      .catch((err) => {
        if (isMounted) setError(err instanceof Error ? err.message : "Unable to load support messages");
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
      <ScreenHeader eyebrow="Support" title="Support messages" description="Track your conversations with support." />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? <Text className="text-error-700">{error}</Text> : null}
        {!isLoading && !error && tickets.length === 0 ? (
          <Text className="text-typography-500">No support tickets found.</Text>
        ) : null}
        {tickets.map((ticket) => (
          <Box key={ticket.id} className="rounded-2xl border border-outline-100 bg-background-0 p-4">
            <Text className="font-semibold text-typography-900">{ticket.subject || "Support ticket"}</Text>
            <Text className="mt-1 text-sm text-typography-500">{ticket.category || "General"}</Text>
            <Text className="mt-2 text-xs text-primary-800">{ticket.status || "pending"}</Text>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
