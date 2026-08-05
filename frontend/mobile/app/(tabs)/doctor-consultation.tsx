import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { fetchHealaConfig, HealaConfig } from "@/lib/enrolleeApi";
import * as WebBrowser from "expo-web-browser";
import { router } from "expo-router";
import { ShieldCheck, Stethoscope, Video } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";

export default function DoctorConsultation() {
  const [config, setConfig] = useState<HealaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    fetchHealaConfig()
      .then((data) => isMounted && setConfig(data))
      .catch((err) => isMounted && setError(err instanceof Error ? err.message : "Doctor consultation is unavailable"))
      .finally(() => isMounted && setIsLoading(false));
    return () => {
      isMounted = false;
    };
  }, []);

  const startConsultation = async () => {
    if (!config?.webLink) return;
    setIsOpening(true);
    setError("");
    try {
      await WebBrowser.openBrowserAsync(config.webLink, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: "#1d4ed8",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to open consultation");
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Telemedicine"
        title="Consult a doctor"
        description="Start a secure virtual consultation from your enrollee account."
        onBack={() => router.back()}
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        <Box className="items-center overflow-hidden rounded-[30px] bg-primary-950 px-6 py-9">
          <Box className="absolute -right-12 -top-10 h-44 w-44 rounded-full bg-primary-600/30" />
          <Box className="h-20 w-20 items-center justify-center rounded-[28px] bg-white/10">
            <Stethoscope color="#ffffff" size={34} />
          </Box>
          <Text className="mt-5 text-center text-2xl font-bold text-white">Care, wherever you are</Text>
          <Text className="mt-2 text-center text-sm leading-6 text-primary-100">
            Continue to {config?.name || "our telemedicine partner"} for a private consultation with a clinician.
          </Text>
          <TouchableOpacity
            onPress={() => void startConsultation()}
            disabled={!config?.webLink || isOpening}
            className="mt-6 flex-row items-center rounded-2xl bg-white px-6 py-4"
          >
            {isOpening ? <ActivityIndicator color="#1d4ed8" /> : <Video color="#1d4ed8" size={19} />}
            <Text className="ml-2 font-semibold text-primary-800">Start consultation</Text>
          </TouchableOpacity>
        </Box>
        <VStack className="rounded-[24px] border border-slate-100 bg-white p-5" space="md">
          <Box className="flex-row items-center">
            <ShieldCheck color="#047857" size={21} />
            <Text className="ml-3 font-semibold text-typography-900">Before you continue</Text>
          </Box>
          <Text className="text-sm leading-6 text-typography-500">
            Choose a private, well-lit space. The consultation service may request camera and microphone access so you can speak with the clinician.
          </Text>
        </VStack>
      </ScrollView>
    </VStack>
  );
}
