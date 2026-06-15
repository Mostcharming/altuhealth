import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { appointments } from "@/data/enrollee";

export default function Appointments() {
  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader
        eyebrow="Care access"
        title="Appointments"
        description="Request and track enrollee appointments."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {appointments.map((appointment) => (
          <Box
            key={appointment.title}
            className="rounded-2xl border border-outline-100 bg-background-0 p-4"
          >
            <HStack className="items-start justify-between">
              <VStack className="mr-4 flex-1" space="xs">
                <Text className="font-semibold text-typography-900">
                  {appointment.title}
                </Text>
                <Text className="text-sm text-typography-500">
                  {appointment.meta}
                </Text>
              </VStack>
              <Box className="rounded-full bg-primary-50 px-3 py-1">
                <Text className="text-xs font-semibold text-primary-800">
                  {appointment.status}
                </Text>
              </Box>
            </HStack>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
