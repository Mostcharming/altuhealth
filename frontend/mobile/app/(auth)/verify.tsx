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
import { ArrowLeft, Eye, EyeOff } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  TextInput as RNTextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OTP_LENGTH = 6;

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

function sanitizeCode(value: string) {
  return value.replace(/[^0-9a-zA-Z]/g, "").slice(0, OTP_LENGTH);
}

export default function VerifyResetPasswordScreen() {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [showPasswords, setShowPasswords] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRefs = useRef<Array<React.ElementRef<typeof RNTextInput> | null>>(
    []
  );
  const passwordInputRef = useRef<React.ElementRef<typeof RNTextInput> | null>(
    null
  );

  const token = otp.join("").trim();

  const handleOtpChange = (value: string, index: number) => {
    const sanitized = sanitizeCode(value);
    const updatedOtp = [...otp];

    if (sanitized.length > 1) {
      sanitized.split("").forEach((char, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < OTP_LENGTH) {
          updatedOtp[targetIndex] = char;
        }
      });

      setOtp(updatedOtp);
      const nextIndex = Math.min(index + sanitized.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    updatedOtp[index] = sanitized;
    setOtp(updatedOtp);

    if (sanitized && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (event.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleContinue = async () => {
    setError(null);
    setSuccess(null);

    if (!showPasswords) {
      if (token.length < OTP_LENGTH) {
        setError("Please enter the 6-digit code sent to you.");
        return;
      }

      setShowPasswords(true);
      setTimeout(() => passwordInputRef.current?.focus(), 200);
      return;
    }

    if (token.length < OTP_LENGTH) {
      setError("The verification token is invalid.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please provide and confirm your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Please ensure both passwords match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient("/enrollee/auth/reset", {
        method: "POST",
        body: { token, password },
      });

      setSuccess(getResponseMessage(response, "Your password has been reset."));
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.replace("/signin"), 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not reset password.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCode = () => {
    setShowPasswords(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 200);
  };

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3500);
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
                  Two Step Verification
                </Text>
                <Text className="text-sm text-gray-500">
                  Enter the code sent to your account and choose a new password.
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

              <VStack
                space="sm"
                className={showPasswords ? "h-0 overflow-hidden opacity-0" : ""}
              >
                <Text className="text-sm font-medium text-gray-700">
                  Type your 6 digits security code
                </Text>
                <HStack space="sm" className="justify-between">
                  {otp.map((value, index) => (
                    <RNTextInput
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] = element;
                      }}
                      value={value}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(event) => handleKeyPress(event, index)}
                      editable={!isLoading}
                      keyboardType="number-pad"
                      textContentType="oneTimeCode"
                      maxLength={OTP_LENGTH}
                      className="h-12 flex-1 rounded-lg border border-gray-300 text-center text-xl font-semibold text-gray-800"
                    />
                  ))}
                </HStack>
              </VStack>

              {showPasswords && (
                <VStack space="md">
                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText className="text-gray-700">
                        New password <Text className="text-red-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Box className="flex-row items-center justify-between rounded-lg border border-gray-300 px-4 py-3">
                      <RNTextInput
                        ref={passwordInputRef}
                        placeholder="New password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showNewPassword}
                        value={password}
                        onChangeText={setPassword}
                        editable={!isLoading}
                        className="flex-1 text-base text-gray-800"
                      />
                      <TouchableOpacity
                        onPress={() => setShowNewPassword((value) => !value)}
                        disabled={isLoading}
                      >
                        {showNewPassword ? (
                          <Eye size={20} color="#6b7280" />
                        ) : (
                          <EyeOff size={20} color="#6b7280" />
                        )}
                      </TouchableOpacity>
                    </Box>
                  </FormControl>

                  <FormControl>
                    <FormControlLabel>
                      <FormControlLabelText className="text-gray-700">
                        Confirm password <Text className="text-red-500">*</Text>
                      </FormControlLabelText>
                    </FormControlLabel>
                    <Box className="flex-row items-center justify-between rounded-lg border border-gray-300 px-4 py-3">
                      <RNTextInput
                        placeholder="Confirm new password"
                        placeholderTextColor="#9ca3af"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!isLoading}
                        className="flex-1 text-base text-gray-800"
                      />
                      <TouchableOpacity
                        onPress={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <Eye size={20} color="#6b7280" />
                        ) : (
                          <EyeOff size={20} color="#6b7280" />
                        )}
                      </TouchableOpacity>
                    </Box>
                  </FormControl>

                  <Text className="text-xs text-gray-500">
                    Passwords must be at least 8 characters long.
                  </Text>
                </VStack>
              )}

              <VStack space="sm" className="mt-2">
                <TouchableOpacity
                  onPress={handleContinue}
                  disabled={isLoading}
                  className="items-center justify-center rounded-lg bg-blue-500 py-3"
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-base font-semibold text-white">
                      {showPasswords ? "Reset Password" : "Continue"}
                    </Text>
                  )}
                </TouchableOpacity>

                {showPasswords && (
                  <TouchableOpacity
                    onPress={handleBackToCode}
                    disabled={isLoading}
                    className="items-center py-2"
                  >
                    <Text className="text-sm text-gray-600">Back to code</Text>
                  </TouchableOpacity>
                )}
              </VStack>

              <HStack className="justify-center">
                <Text className="text-sm text-gray-700">
                  Didn't get the code?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.replace("/forgot-password")}
                  disabled={isLoading}
                >
                  <Text className="text-sm text-blue-500">Resend</Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </Center>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
