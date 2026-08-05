import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { ChevronRight, LucideIcon } from "lucide-react-native";

type FeatureCardProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  onPress?: () => void;
};

export function FeatureCard({
  title,
  description,
  icon,
  onPress,
}: FeatureCardProps) {
  const content = (
    <HStack
      className="items-center rounded-[24px] border border-primary-50 bg-background-0 p-4"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 7 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 2,
      }}
    >
      <Box className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
        <Icon as={icon} className="text-primary-800" size="xl" />
      </Box>
      <VStack className="flex-1" space="xs">
        <Text className="font-semibold text-typography-900">{title}</Text>
        <Text className="text-sm leading-5 text-typography-500">
          {description}
        </Text>
      </VStack>
      {onPress ? <ChevronRight color="#94a3b8" size={20} /> : null}
    </HStack>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}
