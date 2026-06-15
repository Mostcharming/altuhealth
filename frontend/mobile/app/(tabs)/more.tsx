import { FeatureCard } from "@/components/enrollee/FeatureCard";
import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { ScrollView } from "@/components/ui/scroll-view";
import { VStack } from "@/components/ui/vstack";
import { moreFeatures } from "@/data/enrollee";

export default function More() {
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
          />
        ))}
      </ScrollView>
    </VStack>
  );
}
