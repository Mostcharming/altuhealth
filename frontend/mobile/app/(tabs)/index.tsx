import { FeatureCard } from "@/components/enrollee/FeatureCard";
import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { enrolleeStats, quickActions } from "@/data/enrollee";
import { router } from "expo-router";

export default function Home() {
  return (
    <VStack className="flex-1 bg-background-50">
      <ScreenHeader
        eyebrow="Enrollee"
        title="Welcome back"
        description="Manage your cover, appointments, benefits, and support from one place."
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-5 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        <HStack className="flex-wrap" space="sm">
          {enrolleeStats.map((stat) => (
            <Box
              key={stat.label}
              className="mb-3 min-h-24 flex-1 basis-[45%] rounded-2xl border border-outline-100 bg-background-0 p-4"
            >
              <Text className="text-sm text-typography-500">{stat.label}</Text>
              <Text className="mt-2 text-2xl font-bold text-typography-900">
                {stat.value}
              </Text>
            </Box>
          ))}
        </HStack>

        <VStack space="md">
          <Text className="text-lg font-bold text-typography-900">
            Quick actions
          </Text>
          {quickActions.map((action) => (
            <FeatureCard
              key={action.title}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onPress={() => router.push(action.route as never)}
            />
          ))}
        </VStack>
      </ScrollView>
    </VStack>
  );
}
