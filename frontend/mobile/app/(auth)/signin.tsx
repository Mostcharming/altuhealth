import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Checkbox, CheckboxIndicator } from "@/components/ui/checkbox";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Eye, EyeOff } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TextInput as RNTextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

async function getCoordinates(timeoutMs = 8000): Promise<{
  lat: number;
  lon: number;
} | null> {
  return new Promise((resolve) => {
    // For React Native, you'd use expo-location
    // This is a placeholder - implement with expo-location if needed
    resolve(null);
  });
}

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!identifier || !password) {
      setError("Please fill in both email and password");
      setIsLoading(false);
      return;
    }

    // Show network error
    setTimeout(() => {
      setError("Network not enabled. Please check your internet connection.");
      setIsLoading(false);
    }, 1000);
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
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 px-6 py-8"
      >
        <Center className="flex-1 justify-center">
          <VStack space="lg" className="w-full max-w-md">
            {/* Header */}
            <VStack space="sm" className="mb-6">
              <Text className="font-bold text-2xl text-gray-800">
                Sign in
              </Text>
              <Text className="text-sm text-gray-500">
                Enter your email and password to sign in
              </Text>
            </VStack>

            {/* Error Message */}
            {error && (
              <Box className="p-3 bg-red-50 rounded-lg border border-red-200">
                <Text className="text-red-700 text-sm">
                  {error}
                </Text>
              </Box>
            )}

            {/* Success Message */}
            {success && (
              <Box className="p-3 bg-green-50 rounded-lg border border-green-200">
                <Text className="text-green-700 text-sm">
                  {success}
                </Text>
              </Box>
            )}

            {/* Email or Policy Number Field */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700">
                  Email or Policy Number <Text className="text-red-500">*</Text>
                </FormControlLabelText>
              </FormControlLabel>
              <Box className="border border-gray-300 rounded-lg px-4 py-3">
                <RNTextInput
                  placeholder="Email or Policy Number"
                  placeholderTextColor="#9ca3af"
                  value={identifier}
                  onChangeText={setIdentifier}
                  editable={!isLoading}
                  className="text-base text-gray-800"
                />
              </Box>
            </FormControl>

            {/* Password Field */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText className="text-gray-700">
                  Password <Text className="text-red-500">*</Text>
                </FormControlLabelText>
              </FormControlLabel>
              <Box className="border border-gray-300 rounded-lg px-4 py-3 flex-row items-center justify-between">
                <RNTextInput
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!isLoading}
                  className="flex-1 text-base text-gray-800"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <Eye size={20} color="#6b7280" />
                  ) : (
                    <EyeOff size={20} color="#6b7280" />
                  )}
                </TouchableOpacity>
              </Box>
            </FormControl>

            {/* Remember Me & Forgot Password */}
            <HStack space="md" className="items-center justify-between mb-2">
              <HStack space="sm" className="items-center">
                <Checkbox
                  value="remember"
                  isChecked={isChecked}
                  onChange={setIsChecked}
                  isDisabled={isLoading}
                >
                  <CheckboxIndicator />
                </Checkbox>
                <Text className="text-sm text-gray-700">
                  Keep me logged in
                </Text>
              </HStack>
              <TouchableOpacity
                // onPress={() => router.push("/")}
                disabled={isLoading}
              >
                <Text className="text-sm text-blue-500">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </HStack>

            {/* Sign In Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className="bg-blue-500 rounded-lg py-3 items-center mt-4"
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-semibold text-base">
                  Sign in
                </Text>
              )}
            </TouchableOpacity>
          </VStack>
        </Center>
      </ScrollView>
    </SafeAreaView>
  );
}
