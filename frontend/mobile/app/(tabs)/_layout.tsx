import { useAuthStore } from "@/lib/authStore";
import React, { useEffect } from "react";
import { Redirect, Tabs } from "expo-router";
import BottomTabBar from "@/components/shared/bottom-tab-bar";
import { ActivityIndicator, View } from "react-native";

export default function TabLayout() {
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  if (!isHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#1d4ed8" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/signin" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props: any) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="medical-history" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="benefits" />
      <Tabs.Screen name="more" />
      <Tabs.Screen name="dependents" options={{ href: null }} />
      <Tabs.Screen name="hospital-list" options={{ href: null }} />
      <Tabs.Screen name="support-messages" options={{ href: null }} />
      <Tabs.Screen name="womens-health" options={{ href: null }} />
      <Tabs.Screen name="doctor-consultation" options={{ href: null }} />
    </Tabs>
  );
}
