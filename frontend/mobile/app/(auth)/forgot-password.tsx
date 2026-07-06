import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { apiClient } from "@/lib/apiClient";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getResponseMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (typeof record.message === "string") {
      return record.message;
    }

    if (record.data && typeof record.data === "object") {
      const data = record.data as Record<string, unknown>;
      if (typeof data.message === "string") {
        return data.message;
      }
    }
  }

  return fallback;
}

export default function ForgotPasswordScreen() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedIdentifier = identifier.trim();
    setError(null);
    setSuccess(null);

    if (!trimmedIdentifier) {
      setError("Please enter your email or policy number.");
      return;
    }

    setIsLoading(true);

    try {
      const isEmail = /\S+@\S+\.\S+/.test(trimmedIdentifier);
      const bodyPayload = isEmail
        ? { email: trimmedIdentifier.toLowerCase() }
        : { policyNumber: trimmedIdentifier.toUpperCase() };

      const response = await apiClient("/enrollee/auth/forgot", {
        method: "POST",
        body: bodyPayload,
      });

      setSuccess(
        getResponseMessage(response, "Verification code sent successfully.")
      );
      setIdentifier("");
      router.push("/verify");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to send reset code.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          className="flex-1 px-6 py-8"
        >
          <Center className="flex-1 justify-center">
            <VStack space="lg" className="w-full max-w-md">
              <TouchableOpacity
                onPress={() => router.back()}
                disabled={isLoading}
                accessibilityLabel="Go back"
                className="h-10 w-10 items-center justify-center rounded-lg border border-gray-200"
              >
                <ArrowLeft size={20} color="#374151" />
              </TouchableOpacity>

              <VStack space="sm" className="mb-4">
                <Text className="font-bold text-2xl text-gray-800">
                  Forgot password?
                </Text>
                <Text className="text-sm text-gray-500">
                  Enter your email or policy number to receive a reset code.
                </Text>
              </VStack>

              {error && (
                <Box className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <Text className="text-sm text-red-700">{error}</Text>
                </Box>
              )}

              {success && (
                <Box className="rounded-lg border border-green-200 bg-green-50 p-3">
                  <Text className="text-sm text-green-700">{success}</Text>
                </Box>
              )}

              <FormControl>
                <FormControlLabel>
                  <FormControlLabelText className="text-gray-700">
                    Email or Policy Number <Text className="text-red-500">*</Text>
                  </FormControlLabelText>
                </FormControlLabel>
                <Box className="rounded-lg border border-gray-300 px-4 py-3">
                  <RNTextInput
                    placeholder="Enter your email or policy number"
                    placeholderTextColor="#9ca3af"
                    value={identifier}
                    onChangeText={setIdentifier}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    className="text-base text-gray-800"
                  />
                </Box>
              </FormControl>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="mt-2 items-center justify-center rounded-lg bg-blue-500 py-3"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Send Reset Code
                  </Text>
                )}
              </TouchableOpacity>

              <HStack className="justify-center">
                <Text className="text-sm text-gray-700">
                  Remembered your password?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/signin")}
                  disabled={isLoading}
                >
                  <Text className="text-sm text-blue-500">Sign in</Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </Center>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
