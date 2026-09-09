import { FeatureCard } from "@/components/enrollee/FeatureCard";
import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { moreFeatures } from "@/data/enrollee";
import { useAuthStore } from "@/lib/authStore";
import { clearBiometricSession } from "@/lib/biometricAuth";
import { APP_CONFIG } from "@/lib/config";
import { isRetailEnrollee, validatePasswordChange } from "@/lib/enrolleeAccess";
import {
  changePassword,
  cancelAccountDeletionRequest,
  completeSubscriptionCheckout,
  createSubscriptionCheckout,
  fetchDependentVisitPreference,
  fetchAccountDeletionRequest,
  fetchProfile,
  fetchSubscriptionGateways,
  fetchSubscriptionOverview,
  fetchUnreadNotificationCount,
  Profile,
  AccountDeletionRequest,
  RetailSubscription,
  SubscriptionOverview,
  SubscriptionPlan,
  updateDependentVisitPreference,
  updateProfile,
  submitAccountDeletionRequest,
  UploadImage,
} from "@/lib/enrolleeApi";
import * as ImagePicker from "expo-image-picker";
import * as Linking from "expo-linking";
import { router, useFocusEffect } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  BadgeCheck,
  Bell,
  Camera,
  CreditCard,
  KeyRound,
  LogOut,
  Pencil,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  Switch,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(amount = 0, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

function resolvePictureUrl(value?: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const apiOrigin = APP_CONFIG.API_BASE_URL.replace(/\/api\/v\d+\/?$/i, "");
  return `${apiOrigin}${value.startsWith("/") ? "" : "/"}${value}`;
}

export default function More() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const updateStoredUser = useAuthStore((state) => state.updateUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    country: "",
    state: "",
    lga: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [profilePicture, setProfilePicture] = useState<UploadImage | null>(null);
  const [dependentVisitEnabled, setDependentVisitEnabled] = useState<boolean | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [subscription, setSubscription] = useState<SubscriptionOverview | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [gateways, setGateways] = useState<{ provider: string; label: string }[]>([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isDeletionOpen, setIsDeletionOpen] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionRequest | null>(null);
  const [deletionReason, setDeletionReason] = useState("");
  const [deletionConfirmed, setDeletionConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRetail = isRetailEnrollee(user?.type);

  const loadAccount = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const profileData = await fetchProfile();
      const [subscriptionData, preferenceData, unreadCount, deletionData] = await Promise.all([
        isRetail ? fetchSubscriptionOverview().catch(() => null) : Promise.resolve(null),
        fetchDependentVisitPreference().catch(() => ({
          dependentVisitNotificationsEnabled:
            profileData.dependentVisitNotificationsEnabled ?? null,
          requiresDependentVisitSetup:
            profileData.requiresDependentVisitSetup ?? true,
        })),
        fetchUnreadNotificationCount().catch(() => 0),
        fetchAccountDeletionRequest().catch(() => null),
      ]);
      setProfile(profileData);
      setProfileForm({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phoneNumber: profileData.phoneNumber || "",
        state: profileData.state || "",
        lga: profileData.lga || "",
        country: profileData.country || "",
        address: profileData.address || "",
        city: profileData.city || "",
        postalCode: profileData.postalCode || "",
      });
      setDependentVisitEnabled(preferenceData.dependentVisitNotificationsEnabled);
      setUnreadNotifications(unreadCount);
      setDeletionRequest(deletionData);
      if (subscriptionData) setSubscription(subscriptionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load account details");
    } finally {
      setIsLoading(false);
    }
  }, [isRetail]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  useFocusEffect(
    useCallback(() => {
      void fetchUnreadNotificationCount()
        .then(setUnreadNotifications)
        .catch(() => undefined);
    }, [])
  );

  const fullName = useMemo(
    () => [profile?.firstName || user?.firstName, profile?.lastName || user?.lastName].filter(Boolean).join(" ") || user?.email || "Enrollee",
    [profile, user]
  );

  const openSubscription = () => {
    setError("");
    setSuccess("");
    const currentPlan = subscription?.plans?.find((plan) => plan.id === subscription.current?.planId) || subscription?.plans?.[0] || null;
    setSelectedPlan(currentPlan);
    setSelectedGateway("");
    setGateways([]);
    setIsSubscriptionOpen(true);
    if (currentPlan?.currency) {
      void fetchSubscriptionGateways(currentPlan.currency).then((items) => {
        setGateways(items);
        setSelectedGateway(items[0]?.provider || "");
      });
    }
  };

  const choosePlan = async (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setSelectedGateway("");
    setGateways([]);
    setError("");
    try {
      const items = await fetchSubscriptionGateways(plan.currency || "NGN");
      setGateways(items);
      setSelectedGateway(items[0]?.provider || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load payment options");
    }
  };

  const handleProfileSave = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const updated = await updateProfile(profileForm, profilePicture);
      setProfile(updated);
      updateStoredUser(updated);
      setProfilePicture(null);
      setSuccess("Profile updated successfully.");
      setIsProfileOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const chooseProfilePicture = async () => {
    setError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Allow photo-library access to choose a profile picture.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setProfilePicture({
      uri: asset.uri,
      name: asset.fileName || `profile-${Date.now()}.jpg`,
      mimeType: asset.mimeType || "image/jpeg",
      file: asset.file,
    });
  };

  const handlePasswordChange = async () => {
    const validationError = validatePasswordChange(passwordForm);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await changePassword({
        currentPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      setIsPasswordOpen(false);
      setSuccess("Password changed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDependentVisitPreference = async (enabled: boolean) => {
    const previous = dependentVisitEnabled;
    setDependentVisitEnabled(enabled);
    setError("");
    try {
      const preference = await updateDependentVisitPreference(enabled);
      setDependentVisitEnabled(preference.dependentVisitNotificationsEnabled);
      updateStoredUser({
        dependentVisitNotificationsEnabled: preference.dependentVisitNotificationsEnabled,
        requiresDependentVisitSetup: false,
      });
      setSuccess("Dependent visit preference updated.");
    } catch (err) {
      setDependentVisitEnabled(previous);
      setError(err instanceof Error ? err.message : "Unable to update preference");
    }
  };

  const handleSubscriptionPayment = async () => {
    if (!selectedPlan || !selectedGateway) {
      setError("Choose a plan and available payment method.");
      return;
    }
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const returnUrl = Linking.createURL("subscription");
      const checkout = await createSubscriptionCheckout({
        planId: selectedPlan.id,
        gateway: selectedGateway,
        returnUrl,
      });
      const result = await WebBrowser.openAuthSessionAsync(checkout.checkoutUrl, returnUrl);
      if (result.type !== "success" || !("url" in result)) {
        if (result.type !== "cancel") setError("Payment was not completed.");
        return;
      }

      const callback = new URL(result.url);
      if (callback.searchParams.get("payment_status") === "cancelled") {
        setError("Payment was cancelled.");
        return;
      }
      if (
        selectedGateway === "flutterwave" &&
        callback.searchParams.get("status") !== "successful"
      ) {
        setError("Payment was not completed.");
        return;
      }
      const reference =
        callback.searchParams.get("tx_ref") ||
        callback.searchParams.get("reference") ||
        callback.searchParams.get("trxref") ||
        callback.searchParams.get("session_id") ||
        callback.searchParams.get("token") ||
        checkout.checkoutReference;
      const transactionId =
        selectedGateway === "flutterwave"
          ? callback.searchParams.get("transaction_id")
          : undefined;
      if (selectedGateway === "flutterwave" && !transactionId) {
        setError("Flutterwave did not return a transaction ID. Contact support if you were charged.");
        return;
      }
      const mode = subscription?.current?.planId === selectedPlan.id ? "renew" : "change";
      await completeSubscriptionCheckout({
        planId: selectedPlan.id,
        gateway: selectedGateway,
        checkoutReference: reference,
        transactionId,
        mode,
      });
      const refreshed = await fetchSubscriptionOverview();
      setSubscription(refreshed);
      setSuccess(mode === "renew" ? "Subscription renewed successfully." : "Subscription plan updated successfully.");
      setIsSubscriptionOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update subscription");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletionRequest = async () => {
    if (deletionReason.trim().length < 10 || !deletionConfirmed) return;
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const request = await submitAccountDeletionRequest(deletionReason.trim());
      setDeletionRequest(request);
      setDeletionReason("");
      setDeletionConfirmed(false);
      setSuccess("Your account deletion request was sent for admin review.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit deletion request");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletionCancellation = async () => {
    setIsSaving(true);
    setError("");
    setSuccess("");
    try {
      const request = await cancelAccountDeletionRequest();
      setDeletionRequest(request);
      setSuccess("Your account deletion request has been cancelled.");
      setIsDeletionOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel deletion request");
    } finally {
      setIsSaving(false);
    }
  };

  const currentSubscription: RetailSubscription | null | undefined = subscription?.current;
  const profilePictureUri =
    profilePicture?.uri ||
    resolvePictureUrl(profile?.picture || profile?.pictureUrl || user?.picture) ||
    null;

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Account"
        title="More services"
        description="Family cover, support, telemedicine, and account settings."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error && !isProfileOpen && !isPasswordOpen && !isSubscriptionOpen && !isDeletionOpen ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {success ? (
          <Box className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <Text className="text-sm text-emerald-700">{success}</Text>
          </Box>
        ) : null}

        <Box className="rounded-[28px] border border-primary-100 bg-white p-5">
          <HStack className="items-center" space="md">
            {profilePictureUri ? (
              <Image source={{ uri: profilePictureUri }} className="h-16 w-16 rounded-full bg-primary-50" />
            ) : (
              <Box className="h-16 w-16 items-center justify-center rounded-full bg-primary-700">
                <Text className="text-xl font-bold text-white">
                  {`${profile?.firstName?.[0] || user?.firstName?.[0] || ""}${profile?.lastName?.[0] || user?.lastName?.[0] || ""}`.toUpperCase() || "A"}
                </Text>
              </Box>
            )}
            <VStack className="flex-1" space="xs">
              <Text className="text-lg font-bold text-typography-900">{fullName}</Text>
              <Text className="text-sm text-typography-500">{profile?.email || user?.email}</Text>
              <Text className="text-xs font-semibold text-primary-800">{user?.policyNumber || "Policy number unavailable"}</Text>
            </VStack>
            <TouchableOpacity onPress={() => { setError(""); setIsProfileOpen(true); }} className="h-10 w-10 items-center justify-center rounded-2xl bg-primary-50">
              <Pencil color="#1d4ed8" size={18} />
            </TouchableOpacity>
          </HStack>
        </Box>

        <TouchableOpacity
          onPress={() => {
            router.push("/notifications" as never);
          }}
          activeOpacity={0.8}
        >
          <Box className="rounded-[24px] border border-primary-100 bg-white p-4">
            <HStack className="items-center" space="md">
              <Box className="relative h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                <Bell color="#1d4ed8" size={21} />
                {unreadNotifications > 0 ? (
                  <Box className="absolute -right-2 -top-2 min-w-6 items-center rounded-full bg-orange-500 px-1.5 py-1">
                    <Text className="text-[10px] font-bold text-white">
                      {unreadNotifications > 99 ? "99+" : unreadNotifications}
                    </Text>
                  </Box>
                ) : null}
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="font-semibold text-typography-900">Notifications</Text>
                <Text className="text-sm text-typography-500">
                  {unreadNotifications > 0
                    ? `${unreadNotifications} unread healthcare update${unreadNotifications === 1 ? "" : "s"}`
                    : "Appointments, dependent visits, and account updates"}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </TouchableOpacity>

        <Box className="rounded-[24px] border border-slate-100 bg-white p-5">
          <HStack className="items-center" space="md">
            <Box className="h-11 w-11 items-center justify-center rounded-2xl bg-violet-50">
              <ShieldCheck color="#6d28d9" size={21} />
            </Box>
            <VStack className="flex-1" space="xs">
              <Text className="font-semibold text-typography-900">Dependent visit updates</Text>
              <Text className="text-sm leading-5 text-typography-500">
                {dependentVisitEnabled === null
                  ? "Choose whether to receive and view dependent visit updates."
                  : "Receive notifications and medical-history updates when a dependent visits a provider."}
              </Text>
            </VStack>
            {dependentVisitEnabled === null ? (
              <VStack space="xs">
                <TouchableOpacity
                  onPress={() => void handleDependentVisitPreference(true)}
                  className="rounded-full bg-primary-700 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-white">Enable</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => void handleDependentVisitPreference(false)}
                  className="rounded-full bg-slate-100 px-3 py-2"
                >
                  <Text className="text-xs font-semibold text-slate-700">Not now</Text>
                </TouchableOpacity>
              </VStack>
            ) : (
              <Switch
                value={dependentVisitEnabled}
                onValueChange={(enabled) => void handleDependentVisitPreference(enabled)}
                trackColor={{ false: "#cbd5e1", true: "#93c5fd" }}
                thumbColor={dependentVisitEnabled ? "#1d4ed8" : "#ffffff"}
                accessibilityLabel="Dependent visit notification preference"
              />
            )}
          </HStack>
        </Box>

        <TouchableOpacity
          onPress={() => {
            setError("");
            setSuccess("");
            setIsPasswordOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Box className="rounded-[24px] border border-slate-100 bg-white p-4">
            <HStack className="items-center" space="md">
              <Box className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <KeyRound color="#334155" size={21} />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="font-semibold text-typography-900">Change password</Text>
                <Text className="text-sm text-typography-500">Update your account password securely.</Text>
              </VStack>
            </HStack>
          </Box>
        </TouchableOpacity>

        {isRetail ? (
          <TouchableOpacity onPress={openSubscription} activeOpacity={0.8}>
            <Box className="overflow-hidden rounded-[28px] bg-emerald-700 p-5">
              <Box className="absolute -right-8 -top-12 h-40 w-40 rounded-full bg-white/10" />
              <HStack className="items-start justify-between">
                <VStack className="mr-4 flex-1" space="xs">
                  <Text className="text-xs font-semibold uppercase tracking-widest text-emerald-100">Retail subscription</Text>
                  <Text className="text-xl font-bold text-white">{currentSubscription?.plan?.name || "Choose a health plan"}</Text>
                  <Text className="mt-2 text-sm text-emerald-100">
                    {currentSubscription
                      ? `Coverage ends ${formatDate(currentSubscription.subscriptionEndDate)}`
                      : "Set up or renew your individual cover."}
                  </Text>
                </VStack>
                <Box className="h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <RefreshCw color="#ffffff" size={21} />
                </Box>
              </HStack>
              <Text className="mt-5 font-semibold text-white">Renew or change plan →</Text>
            </Box>
          </TouchableOpacity>
        ) : null}

        <Text className="mt-2 text-lg font-bold text-typography-900">Enrollee services</Text>
        {moreFeatures.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            onPress={() => router.push(feature.route as never)}
          />
        ))}
        <TouchableOpacity
          onPress={() => {
            setError("");
            setSuccess("");
            setIsDeletionOpen(true);
          }}
          activeOpacity={0.8}
        >
          <Box className="rounded-[24px] border border-red-200 bg-red-50 p-4">
            <HStack className="items-center" space="md">
              <Box className="h-12 w-12 items-center justify-center rounded-2xl bg-red-100">
                <Trash2 color="#b91c1c" size={21} />
              </Box>
              <VStack className="flex-1" space="xs">
                <Text className="font-semibold text-red-900">Delete account</Text>
                <Text className="text-sm leading-5 text-red-700">
                  {deletionRequest?.status === "pending"
                    ? "Your request is awaiting admin review."
                    : deletionRequest?.status === "approved"
                      ? `${deletionRequest.retentionDaysRemaining ?? 0} day(s) remain to cancel.`
                      : "Request deletion or review your current status."}
                </Text>
              </VStack>
            </HStack>
          </Box>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            clearAuth();
            void clearBiometricSession();
            router.replace("/signin");
          }}
          className="mt-2 flex-row items-center justify-center rounded-2xl border border-error-200 bg-error-50 p-4"
        >
          <LogOut color="#b91c1c" size={18} />
          <Text className="ml-2 font-semibold text-error-700">Sign out</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={isProfileOpen} transparent animationType="slide" onRequestClose={() => setIsProfileOpen(false)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="max-h-[90%] rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <HStack className="items-center justify-between">
              <HStack className="items-center" space="sm">
                <UserRound color="#1d4ed8" size={22} />
                <Text className="text-xl font-bold text-typography-900">Edit profile</Text>
              </HStack>
              <TouchableOpacity onPress={() => setIsProfileOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <ScrollView className="mt-5" contentContainerClassName="gap-4 pb-6" keyboardShouldPersistTaps="handled">
              {error ? (
                <Box className="rounded-2xl border border-error-200 bg-error-50 p-3"><Text className="text-sm text-error-700">{error}</Text></Box>
              ) : null}
              <TouchableOpacity
                onPress={() => void chooseProfilePicture()}
                className="items-center rounded-[24px] border border-dashed border-primary-200 bg-primary-50 p-5"
              >
                {profilePictureUri ? (
                  <Image source={{ uri: profilePictureUri }} className="h-24 w-24 rounded-full bg-white" />
                ) : (
                  <Box className="h-24 w-24 items-center justify-center rounded-full bg-white">
                    <Camera color="#1d4ed8" size={28} />
                  </Box>
                )}
                <Text className="mt-3 font-semibold text-primary-800">
                  {profilePictureUri ? "Change profile picture" : "Add profile picture"}
                </Text>
              </TouchableOpacity>
              {([
                ["First name", "firstName"],
                ["Last name", "lastName"],
                ["Phone number", "phoneNumber"],
                ["Country", "country"],
                ["State", "state"],
                ["LGA / Area", "lga"],
                ["Address", "address"],
                ["City", "city"],
                ["Postal code", "postalCode"],
              ] as const).map(([label, key]) => (
                <VStack key={key} space="xs">
                  <Text className="text-sm font-semibold text-typography-700">{label}</Text>
                  <TextInput
                    value={profileForm[key]}
                    onChangeText={(value) => setProfileForm((current) => ({ ...current, [key]: value }))}
                    placeholder={label}
                    placeholderTextColor="#94a3b8"
                    keyboardType={key === "phoneNumber" ? "phone-pad" : "default"}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                  />
                </VStack>
              ))}
              <TouchableOpacity onPress={() => void handleProfileSave()} disabled={isSaving} className="items-center rounded-2xl bg-primary-700 py-4">
                {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text className="font-semibold text-white">Save profile</Text>}
              </TouchableOpacity>
            </ScrollView>
          </VStack>
        </Box>
      </Modal>

      <Modal visible={isPasswordOpen} transparent animationType="slide" onRequestClose={() => setIsPasswordOpen(false)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <HStack className="items-center justify-between">
              <HStack className="items-center" space="sm">
                <KeyRound color="#1d4ed8" size={22} />
                <Text className="text-xl font-bold text-typography-900">Change password</Text>
              </HStack>
              <TouchableOpacity onPress={() => setIsPasswordOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <VStack className="mt-5" space="md">
              {error ? (
                <Box className="rounded-2xl border border-error-200 bg-error-50 p-3">
                  <Text className="text-sm text-error-700">{error}</Text>
                </Box>
              ) : null}
              {([
                ["Current password", "oldPassword"],
                ["New password", "newPassword"],
                ["Confirm new password", "confirmPassword"],
              ] as const).map(([label, key]) => (
                <VStack key={key} space="xs">
                  <Text className="text-sm font-semibold text-typography-700">{label}</Text>
                  <TextInput
                    value={passwordForm[key]}
                    onChangeText={(value) =>
                      setPasswordForm((current) => ({ ...current, [key]: value }))
                    }
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholder={label}
                    placeholderTextColor="#94a3b8"
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                  />
                </VStack>
              ))}
              <Text className="text-xs leading-5 text-typography-500">
                Use at least 8 characters. Your biometric sign-in remains linked to this device session.
              </Text>
              <TouchableOpacity onPress={() => void handlePasswordChange()} disabled={isSaving} className="items-center rounded-2xl bg-primary-700 py-4">
                {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text className="font-semibold text-white">Update password</Text>}
              </TouchableOpacity>
            </VStack>
          </VStack>
        </Box>
      </Modal>

      <Modal visible={isDeletionOpen} transparent animationType="slide" onRequestClose={() => setIsDeletionOpen(false)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="max-h-[90%] rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <HStack className="items-center justify-between">
              <HStack className="items-center" space="sm">
                <Trash2 color="#b91c1c" size={22} />
                <Text className="text-xl font-bold text-typography-900">Delete account</Text>
              </HStack>
              <TouchableOpacity onPress={() => setIsDeletionOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>

            <ScrollView className="mt-5" contentContainerClassName="gap-4 pb-6" keyboardShouldPersistTaps="handled">
              <Box className="rounded-[24px] border border-red-200 bg-red-50 p-4">
                <Text className="text-sm leading-6 text-red-800">
                  An admin must approve your request. Once approved, your data is kept for 60 days and you can cancel at any time during that window. After 60 days, your account is archived and you cannot sign in again.
                </Text>
              </Box>

              {error ? (
                <Box className="rounded-2xl border border-error-200 bg-error-50 p-3">
                  <Text className="text-sm text-error-700">{error}</Text>
                </Box>
              ) : null}

              {deletionRequest ? (
                <Box className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-typography-500">Current status</Text>
                  <Text className="mt-2 text-lg font-bold capitalize text-typography-900">
                    {deletionRequest.status === "pending" ? "Awaiting admin review" : deletionRequest.status}
                  </Text>
                  {deletionRequest.status === "approved" ? (
                    <Text className="mt-2 text-sm leading-5 text-red-700">
                      {deletionRequest.retentionDaysRemaining ?? 0} day(s) remain. Access ends {formatDate(deletionRequest.retentionExpiresAt || undefined)}.
                    </Text>
                  ) : null}
                  {deletionRequest.status === "pending" ? (
                    <Text className="mt-2 text-sm leading-5 text-amber-700">Your account remains active while this is reviewed.</Text>
                  ) : null}
                  {deletionRequest.adminNote ? (
                    <Text className="mt-3 text-sm leading-5 text-typography-600">Admin note: {deletionRequest.adminNote}</Text>
                  ) : null}
                  {deletionRequest.canCancel ? (
                    <TouchableOpacity
                      onPress={() => void handleDeletionCancellation()}
                      disabled={isSaving}
                      className="mt-4 items-center rounded-2xl border border-slate-300 bg-white py-4"
                    >
                      {isSaving ? <ActivityIndicator color="#334155" /> : <Text className="font-semibold text-slate-700">Cancel deletion request</Text>}
                    </TouchableOpacity>
                  ) : null}
                </Box>
              ) : null}

              {!deletionRequest || ["declined", "cancelled"].includes(deletionRequest.status) ? (
                <VStack space="md">
                  <VStack space="xs">
                    <Text className="text-sm font-semibold text-typography-700">Reason for deletion</Text>
                    <TextInput
                      value={deletionReason}
                      onChangeText={setDeletionReason}
                      multiline
                      numberOfLines={5}
                      maxLength={2000}
                      textAlignVertical="top"
                      placeholder="Please provide at least 10 characters."
                      placeholderTextColor="#94a3b8"
                      className="min-h-32 rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                    />
                  </VStack>
                  <TouchableOpacity
                    onPress={() => setDeletionConfirmed((current) => !current)}
                    className="flex-row items-start"
                    activeOpacity={0.8}
                  >
                    <Box className={`mt-0.5 h-5 w-5 items-center justify-center rounded border ${deletionConfirmed ? "border-red-600 bg-red-600" : "border-slate-300 bg-white"}`}>
                      {deletionConfirmed ? <Text className="text-xs font-bold text-white">✓</Text> : null}
                    </Box>
                    <Text className="ml-3 flex-1 text-sm leading-5 text-typography-600">
                      I understand an approved request becomes permanent after the 60-day cancellation window.
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => void handleDeletionRequest()}
                    disabled={isSaving || !deletionConfirmed || deletionReason.trim().length < 10}
                    className="items-center rounded-2xl bg-red-700 py-4 disabled:opacity-50"
                  >
                    {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text className="font-semibold text-white">Submit deletion request</Text>}
                  </TouchableOpacity>
                </VStack>
              ) : null}
            </ScrollView>
          </VStack>
        </Box>
      </Modal>

      <Modal visible={isSubscriptionOpen} transparent animationType="slide" onRequestClose={() => setIsSubscriptionOpen(false)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="h-[92%] rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 18) }}>
            <HStack className="items-center justify-between">
              <HStack className="items-center" space="sm">
                <CreditCard color="#047857" size={23} />
                <VStack>
                  <Text className="text-xl font-bold text-typography-900">Retail subscription</Text>
                  <Text className="text-sm text-typography-500">Renew or move to another plan</Text>
                </VStack>
              </HStack>
              <TouchableOpacity onPress={() => setIsSubscriptionOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            {error ? (
              <Box className="mt-4 rounded-2xl border border-error-200 bg-error-50 p-3"><Text className="text-sm text-error-700">{error}</Text></Box>
            ) : null}
            <ScrollView className="mt-5 flex-1" contentContainerClassName="gap-4 pb-5">
              {currentSubscription ? (
                <Box className="rounded-[24px] bg-emerald-50 p-5">
                  <HStack className="items-center" space="sm">
                    <BadgeCheck color="#047857" size={21} />
                    <Text className="font-bold text-emerald-900">Current cover</Text>
                  </HStack>
                  <Text className="mt-3 text-lg font-bold text-typography-900">{currentSubscription.plan?.name || "Retail plan"}</Text>
                  <Text className="mt-1 text-sm text-typography-600">Active until {formatDate(currentSubscription.subscriptionEndDate)}</Text>
                </Box>
              ) : null}
              <Text className="text-lg font-bold text-typography-900">Choose a plan</Text>
              {(subscription?.plans || []).map((plan) => {
                const active = selectedPlan?.id === plan.id;
                const current = currentSubscription?.planId === plan.id;
                return (
                  <TouchableOpacity key={plan.id} onPress={() => void choosePlan(plan)} activeOpacity={0.8}>
                    <Box className={`rounded-[24px] border p-5 ${active ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                      <HStack className="items-start justify-between">
                        <VStack className="mr-4 flex-1" space="xs">
                          <HStack className="items-center" space="xs">
                            <Text className="text-lg font-bold text-typography-900">{plan.name || "Health plan"}</Text>
                            {current ? <Text className="text-xs font-semibold text-emerald-700">CURRENT</Text> : null}
                          </HStack>
                          <Text className="text-sm leading-5 text-typography-500">{plan.description || `${plan.planCycle || "Annual"} health cover`}</Text>
                          <Text className="mt-2 text-xl font-bold text-emerald-800">{formatMoney(plan.amount, plan.currency)}</Text>
                        </VStack>
                        <Box className={`h-5 w-5 rounded-full border-2 ${active ? "border-emerald-600 bg-emerald-600" : "border-slate-300"}`} />
                      </HStack>
                    </Box>
                  </TouchableOpacity>
                );
              })}
              {selectedPlan ? (
                <>
                  <Text className="text-lg font-bold text-typography-900">Payment method</Text>
                  {gateways.length === 0 ? (
                    <Text className="text-sm text-typography-500">No payment gateway is currently available for {selectedPlan.currency || "this currency"}.</Text>
                  ) : (
                    <HStack className="gap-2">
                      {gateways.map((gateway) => (
                        <TouchableOpacity
                          key={gateway.provider}
                          onPress={() => setSelectedGateway(gateway.provider)}
                          className={`flex-1 items-center rounded-2xl border py-4 ${selectedGateway === gateway.provider ? "border-emerald-600 bg-emerald-50" : "border-slate-200"}`}
                        >
                          <Text className={selectedGateway === gateway.provider ? "font-semibold text-emerald-800" : "text-typography-600"}>{gateway.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </HStack>
                  )}
                  <TouchableOpacity onPress={() => void handleSubscriptionPayment()} disabled={isSaving || !selectedGateway} className="mt-2 items-center rounded-2xl bg-emerald-700 py-4">
                    {isSaving ? <ActivityIndicator color="#ffffff" /> : (
                      <Text className="font-semibold text-white">
                        {currentSubscription?.planId === selectedPlan.id ? "Renew subscription" : "Change plan and pay"}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : null}
              {(subscription?.history || []).length > 0 ? (
                <VStack className="mt-2" space="sm">
                  <Text className="text-lg font-bold text-typography-900">Subscription history</Text>
                  {(subscription?.history || []).map((item) => (
                    <Box key={item.id} className="rounded-[20px] border border-slate-200 bg-slate-50 p-4">
                      <HStack className="items-start justify-between" space="sm">
                        <VStack className="flex-1" space="xs">
                          <Text className="font-semibold text-typography-900">
                            {item.plan?.name || "Retail plan"}
                          </Text>
                          <Text className="text-sm text-typography-500">
                            {formatDate(item.subscriptionStartDate)} – {formatDate(item.subscriptionEndDate)}
                          </Text>
                          {item.referenceNumber ? (
                            <Text className="text-xs text-typography-400">Ref: {item.referenceNumber}</Text>
                          ) : null}
                        </VStack>
                        <VStack className="items-end" space="xs">
                          <Text className="font-semibold text-emerald-800">
                            {formatMoney(item.amountPaid, item.currency)}
                          </Text>
                          <Text className="text-xs font-semibold uppercase text-typography-500">
                            {item.status || (item.isRenewal ? "Renewal" : "Paid")}
                          </Text>
                        </VStack>
                      </HStack>
                    </Box>
                  ))}
                </VStack>
              ) : null}
            </ScrollView>
          </VStack>
        </Box>
      </Modal>
    </VStack>
  );
}
