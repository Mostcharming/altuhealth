import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { benefitGroups } from "@/data/enrollee";
import { Check } from "lucide-react-native";

export default function Benefits() {
  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader
        eyebrow="Plan cover"
        title="Benefits"
        description="Review the key services available to this enrollee."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {benefitGroups.map((benefit) => (
          <HStack
            key={benefit}
            className="items-center rounded-2xl border border-outline-100 bg-background-0 p-4"
          >
            <Box className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-success-50">
              <Check color="#166534" size={18} />
            </Box>
            <Text className="font-semibold text-typography-900">{benefit}</Text>
          </HStack>
        ))}
      </ScrollView>
    </VStack>
  );
}
