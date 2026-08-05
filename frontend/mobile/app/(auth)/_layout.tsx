import { useAuthStore } from "@/lib/authStore";
import { Redirect } from "expo-router";
import { Stack } from "expo-router";
import React from "react";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
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

  if (token) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="verify" />
    </Stack>
  );
}
