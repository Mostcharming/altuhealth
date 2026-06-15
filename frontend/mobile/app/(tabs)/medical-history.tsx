import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const records = [
  ["Blood group", "O+"],
  ["Genotype", "AA"],
  ["Known allergies", "No allergies recorded"],
  ["Current medication", "No active medication"],
];

export default function MedicalHistory() {
  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader
        eyebrow="Health records"
        title="Medical history"
        description="A mobile view of the enrollee medical profile and clinical notes."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {records.map(([label, value]) => (
          <Box
            key={label}
            className="rounded-2xl border border-outline-100 bg-background-0 p-4"
          >
            <Text className="text-sm text-typography-500">{label}</Text>
            <Text className="mt-2 font-semibold text-typography-900">
              {value}
            </Text>
          </Box>
        ))}
      </ScrollView>
    </VStack>
  );
}
