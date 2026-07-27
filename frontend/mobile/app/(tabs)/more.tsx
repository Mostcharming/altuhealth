import { FeatureCard } from "@/components/enrollee/FeatureCard";
import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { Pressable } from "@/components/ui/pressable";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { moreFeatures } from "@/data/enrollee";
import { useAuthStore } from "@/lib/authStore";
import { router } from "expo-router";

export default function More() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader
        eyebrow="More"
        title="Enrollee services"
        description="Additional features from the enrollee portal."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {moreFeatures.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            onPress={() => router.push(feature.route as never)}
          />
        ))}
        <Pressable
          onPress={() => {
            clearAuth();
            router.replace("/signin");
          }}
        >
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="font-semibold text-error-700">Logout</Text>
          </Box>
        </Pressable>
      </ScrollView>
    </VStack>
  );
}
