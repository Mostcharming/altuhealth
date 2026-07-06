import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { LucideIcon } from "lucide-react-native";

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
    <HStack className="items-center rounded-2xl border border-outline-100 bg-background-0 p-4">
      <Box className="mr-3 h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
        <Icon as={icon} className="text-primary-800" size="xl" />
      </Box>
      <VStack className="flex-1" space="xs">
        <Text className="font-semibold text-typography-900">{title}</Text>
        <Text className="text-sm leading-5 text-typography-500">
          {description}
        </Text>
      </VStack>
    </HStack>
  );

  if (!onPress) {
    return content;
  }

  return <Pressable onPress={onPress}>{content}</Pressable>;
}
