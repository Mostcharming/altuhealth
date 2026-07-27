import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function ScreenHeader({ eyebrow, title, description }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <Box
      className="bg-primary-800 px-5 pb-6"
      style={{ paddingTop: insets.top + 20 }}
    >
      <VStack space="xs">
        {eyebrow ? (
          <Text className="text-xs font-semibold uppercase text-primary-100">
            {eyebrow}
          </Text>
        ) : null}
        <Text className="text-2xl font-bold text-white">{title}</Text>
        {description ? (
          <Text className="text-sm leading-5 text-primary-100">
            {description}
          </Text>
        ) : null}
      </VStack>
    </Box>
  );
}
