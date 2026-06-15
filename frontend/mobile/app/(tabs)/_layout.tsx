import { useAuthStore } from "@/lib/authStore";
import React from "react";
import { Redirect, Tabs } from "expo-router";
import BottomTabBar from "@/components/shared/bottom-tab-bar";

export default function TabLayout() {
  const token = useAuthStore((state) => state.token);

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
    </Tabs>
  );
}
