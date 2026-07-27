import { useAuthStore } from "@/lib/authStore";
import { Redirect } from "expo-router";
import { Stack } from "expo-router";
import React from "react";

export default function AuthLayout() {
  const token = useAuthStore((state) => state.token);

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
