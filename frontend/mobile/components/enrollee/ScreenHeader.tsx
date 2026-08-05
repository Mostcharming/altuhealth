import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  onBack?: () => void;
};

export function ScreenHeader({ eyebrow, title, description, onBack }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={["#102a56", "#164ea6", "#1d6de3"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top + 14 }}
      className="overflow-hidden rounded-b-[34px] px-5 pb-7"
    >
      <Box className="absolute -right-10 -top-8 h-40 w-40 rounded-full bg-white/10" />
      <Box className="absolute -bottom-16 left-20 h-36 w-36 rounded-full bg-primary-300/20" />
      <HStack className="items-start" space="md">
        {onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Go back"
            className="mt-1 h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10"
          >
            <ArrowLeft color="#ffffff" size={20} />
          </Pressable>
        ) : null}
        <VStack className="flex-1" space="xs">
          {eyebrow ? (
            <Text className="text-xs font-semibold uppercase tracking-widest text-primary-100">
              {eyebrow}
            </Text>
          ) : null}
          <Text className="text-3xl font-bold tracking-tight text-white">{title}</Text>
          {description ? (
            <Text className="max-w-[92%] text-sm leading-5 text-primary-100">
              {description}
            </Text>
          ) : null}
        </VStack>
      </HStack>
    </LinearGradient>
  );
}
