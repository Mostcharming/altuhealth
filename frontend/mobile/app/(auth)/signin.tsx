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
import {
  authenticateWithBiometrics,
  canUseBiometrics,
  saveBiometricSession,
} from "@/lib/biometricAuth";
import { apiClient } from "@/lib/apiClient";
import { useAuthStore } from "@/lib/authStore";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Eye, EyeOff, Fingerprint } from "lucide-react-native";
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
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.status !== Location.PermissionStatus.GRANTED) {
      return null;
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: timeoutMs,
    });

    return {
      lat: position.coords.latitude,
      lon: position.coords.longitude,
    };
  } catch (err) {
    console.warn("Geolocation error:", err);
    return null;
  }
}

async function getLocationName(
  lat: number,
  lon: number
): Promise<string | null> {
  try {
    const places = await Location.reverseGeocodeAsync({
      latitude: lat,
      longitude: lon,
    });
    const place = places[0];

    if (!place) {
      return null;
    }

    return [place.region, place.country].filter(Boolean).join(", ") || null;
  } catch (err) {
    console.warn("Reverse geocoding failed:", err);
    return null;
  }
}

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    let isMounted = true;

    canUseBiometrics()
      .then((available) => {
        if (isMounted) {
          setIsBiometricAvailable(available);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsBiometricAvailable(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!identifier || !password) {
      setError("Please fill in both email and password");
      setIsLoading(false);
      return;
    }

    try {
      const coords = await getCoordinates();
      const currentLocation = coords
        ? await getLocationName(coords.lat, coords.lon)
        : null;
      const isEmail = /\S+@\S+\.\S+/.test(identifier.trim());
      const bodyPayload: Record<string, unknown> = {
        password,
        remember: isChecked,
        location: {
          lat: coords?.lat || null,
          lon: coords?.lon || null,
          currentLocation,
        },
      };

      if (isEmail) {
        bodyPayload.email = identifier.trim();
      } else {
        bodyPayload.policyNumber = identifier.trim();
      }

      const response = await apiClient("/enrollee/auth/login", {
        method: "POST",
        body: bodyPayload,
      });
      const payload = response && typeof response === "object" ? response : {};
      const user = (payload as any).user ?? (payload as any).data?.user ?? null;
      const token =
        (payload as any).token ??
        (payload as any).data?.token ??
        (payload as any).accessToken ??
        null;

      if (!user || !token) {
        throw new Error("Invalid response from server");
      }

      login(user, token);
      await saveBiometricSession({ user, token });
      setSuccess(
        `Welcome back, ${user.firstName || user.email || "enrollee"}.`
      );
      setIdentifier("");
      setPassword("");
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setSuccess(null);

    if (!isBiometricAvailable) {
      setError(
        "Biometric login is not available on this device. Add fingerprint or Face ID in your device settings, then try again."
      );
      return;
    }

    setIsBiometricLoading(true);

    try {
      const session = await authenticateWithBiometrics();
      login(session.user as any, session.token);
      router.replace("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to sign in with biometrics";
      setError(message);
    } finally {
      setIsBiometricLoading(false);
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
            <HStack space="sm" className="mt-4">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="flex-1 bg-blue-500 rounded-lg py-3 items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Sign in
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBiometricLogin}
                disabled={isBiometricLoading || isLoading}
                accessibilityLabel="Sign in with biometrics"
                className="h-12 w-12 border border-blue-500 rounded-lg items-center justify-center"
              >
                {isBiometricLoading ? (
                  <ActivityIndicator color="#3b82f6" size="small" />
                ) : (
                  <Fingerprint size={22} color="#3b82f6" />
                )}
              </TouchableOpacity>
            </HStack>
          </VStack>
        </Center>
      </ScrollView>
    </SafeAreaView>
  );
}
