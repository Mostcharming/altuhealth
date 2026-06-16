import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function DoctorConsultation() {
  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader eyebrow="Telemedicine" title="Consult a doctor" description="Use your enrollee account to start a doctor consultation." />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        <Box className="rounded-2xl border border-outline-100 bg-background-0 p-4">
          <Text className="font-semibold text-typography-900">Doctor consultation</Text>
          <Text className="mt-2 text-sm leading-5 text-typography-500">
            This mobile entry mirrors the enrollee portal consultation feature. Connect the final telemedicine URL or in-app consultation flow here when it is available.
          </Text>
        </Box>
      </ScrollView>
    </VStack>
  );
}
