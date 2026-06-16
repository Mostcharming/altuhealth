import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const BIOMETRIC_SESSION_KEY = "altu_enrollee_biometric_session";

type StoredSession = {
  user: unknown;
  token: string;
};

export async function saveBiometricSession(session: StoredSession) {
  await SecureStore.setItemAsync(
    BIOMETRIC_SESSION_KEY,
    JSON.stringify(session)
  );
}

export async function getBiometricSession() {
  const raw = await SecureStore.getItemAsync(BIOMETRIC_SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    await SecureStore.deleteItemAsync(BIOMETRIC_SESSION_KEY);
    return null;
  }
}

export async function canUseBiometrics() {
  const [hasHardware, isEnrolled] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
  ]);

  return hasHardware && isEnrolled;
}

export async function authenticateWithBiometrics() {
  const label = Platform.OS === "ios" ? "Face ID" : "fingerprint";
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: `Sign in with ${label}`,
    fallbackLabel: "Use passcode",
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });

  if (!result.success) {
    throw new Error("Biometric authentication was cancelled or failed.");
  }

  const session = await getBiometricSession();
  if (!session?.token) {
    throw new Error("No saved biometric session. Sign in with your password first.");
  }

  return session;
}
