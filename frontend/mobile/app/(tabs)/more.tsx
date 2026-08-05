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
import {
  completeSubscriptionCheckout,
  createSubscriptionCheckout,
  fetchProfile,
  fetchSubscriptionGateways,
  fetchSubscriptionOverview,
  Profile,
  RetailSubscription,
  SubscriptionOverview,
  SubscriptionPlan,
  updateProfile,
} from "@/lib/enrolleeApi";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import {
  BadgeCheck,
  CreditCard,
  LogOut,
  Pencil,
  RefreshCw,
  UserRound,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, TextInput, TouchableOpacity } from "react-native";
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

export default function More() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const updateStoredUser = useAuthStore((state) => state.updateUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "", phoneNumber: "", state: "", lga: "", country: "" });
  const [subscription, setSubscription] = useState<SubscriptionOverview | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [gateways, setGateways] = useState<Array<{ provider: string; label: string }>>([]);
  const [selectedGateway, setSelectedGateway] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isRetail = user?.type === "RetailEnrollee";

  const loadAccount = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const [profileData, subscriptionData] = await Promise.all([
        fetchProfile(),
        isRetail ? fetchSubscriptionOverview() : Promise.resolve(null),
      ]);
      setProfile(profileData);
      setProfileForm({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        phoneNumber: profileData.phoneNumber || "",
        state: profileData.state || "",
        lga: profileData.lga || "",
        country: profileData.country || "",
      });
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
      const updated = await updateProfile(profileForm);
      setProfile(updated);
      updateStoredUser(updated);
      setSuccess("Profile updated successfully.");
      setIsProfileOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile");
    } finally {
      setIsSaving(false);
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
      const reference =
        callback.searchParams.get("reference") ||
        callback.searchParams.get("trxref") ||
        callback.searchParams.get("session_id") ||
        callback.searchParams.get("token") ||
        checkout.checkoutReference;
      const mode = subscription?.current?.planId === selectedPlan.id ? "renew" : "change";
      await completeSubscriptionCheckout({
        planId: selectedPlan.id,
        gateway: selectedGateway,
        checkoutReference: reference,
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

  const currentSubscription: RetailSubscription | null | undefined = subscription?.current;

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Account"
        title="More services"
        description="Family cover, support, telemedicine, and account settings."
      />
      <ScrollView contentContainerClassName="gap-4 px-5 py-5">
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error && !isProfileOpen && !isSubscriptionOpen ? (
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
            <Box className="h-16 w-16 items-center justify-center rounded-full bg-primary-700">
              <Text className="text-xl font-bold text-white">
                {`${profile?.firstName?.[0] || user?.firstName?.[0] || ""}${profile?.lastName?.[0] || user?.lastName?.[0] || ""}`.toUpperCase() || "A"}
              </Text>
            </Box>
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
              {([
                ["First name", "firstName"],
                ["Last name", "lastName"],
                ["Phone number", "phoneNumber"],
                ["Country", "country"],
                ["State", "state"],
                ["LGA / Area", "lga"],
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
            </ScrollView>
          </VStack>
        </Box>
      </Modal>
    </VStack>
  );
}
