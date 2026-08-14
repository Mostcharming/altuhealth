import { ScreenHeader } from "@/components/enrollee/ScreenHeader";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import {
  createDependent,
  deleteDependent,
  Dependent,
  fetchDependentMedicalHistory,
  fetchDependents,
  MedicalHistoryRecord,
  updateDependent,
  UploadImage,
} from "@/lib/enrolleeApi";
import { APP_CONFIG } from "@/lib/config";
import { useAuthStore } from "@/lib/authStore";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Camera, FileHeart, Pencil, Plus, Trash2, UserRound, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DependentForm = {
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  relationshipToEnrollee: string;
  phoneNumber: string;
  email: string;
  occupation: string;
  maritalStatus: string;
  preexistingMedicalRecords: string;
  notes: string;
};

const EMPTY_FORM: DependentForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "male",
  relationshipToEnrollee: "child",
  phoneNumber: "",
  email: "",
  occupation: "",
  maritalStatus: "single",
  preexistingMedicalRecords: "",
  notes: "",
};

function displayName(dependent: Dependent) {
  return [dependent.firstName, dependent.lastName].filter(Boolean).join(" ") || "Dependent";
}

function formatDate(value?: string) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function resolvePictureUrl(value?: string) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const apiOrigin = APP_CONFIG.API_BASE_URL.replace(/\/api\/v\d+\/?$/i, "");
  return `${apiOrigin}${value.startsWith("/") ? "" : "/"}${value}`;
}

export default function Dependents() {
  const insets = useSafeAreaInsets();
  const canViewDependentHistory = useAuthStore(
    (state) => state.user?.dependentVisitNotificationsEnabled === true
  );
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [selected, setSelected] = useState<Dependent | null>(null);
  const [histories, setHistories] = useState<MedicalHistoryRecord[]>([]);
  const [form, setForm] = useState<DependentForm>(EMPTY_FORM);
  const [picture, setPicture] = useState<UploadImage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError("");
    try {
      setDependents(await fetchDependents());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dependents");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetails = async (dependent: Dependent) => {
    setSelected(dependent);
    setHistories([]);
    if (!canViewDependentHistory) {
      setIsLoadingHistory(false);
      return;
    }
    setIsLoadingHistory(true);
    try {
      setHistories(await fetchDependentMedicalHistory(dependent.id));
    } catch {
      setHistories([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setPicture(null);
    setError("");
    setIsFormOpen(true);
  };

  const openEdit = (dependent: Dependent) => {
    setSelected(null);
    setEditingId(dependent.id);
    setForm({
      firstName: dependent.firstName || "",
      middleName: dependent.middleName || "",
      lastName: dependent.lastName || "",
      dateOfBirth: dependent.dateOfBirth?.slice(0, 10) || "",
      gender: dependent.gender || "other",
      relationshipToEnrollee: dependent.relationshipToEnrollee || "other",
      phoneNumber: dependent.phoneNumber || "",
      email: dependent.email || "",
      occupation: dependent.occupation || "",
      maritalStatus: dependent.maritalStatus || "single",
      preexistingMedicalRecords: dependent.preexistingMedicalRecords || "",
      notes: dependent.notes || "",
    });
    setPicture(null);
    setError("");
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName.trim() || !form.lastName.trim() || !form.dateOfBirth.trim()) {
      setError("First name, last name, and date of birth are required.");
      return;
    }
    if (Number.isNaN(new Date(form.dateOfBirth).getTime())) {
      setError("Enter date of birth as YYYY-MM-DD.");
      return;
    }

    setIsSaving(true);
    setError("");
    const payload = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phoneNumber: form.phoneNumber.trim() || undefined,
      email: form.email.trim() || undefined,
      middleName: form.middleName.trim() || undefined,
      occupation: form.occupation.trim() || undefined,
      maritalStatus: form.maritalStatus || undefined,
      preexistingMedicalRecords: form.preexistingMedicalRecords.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (editingId) {
        await updateDependent(editingId, payload, picture);
      } else {
        await createDependent({ ...payload, picture });
      }
      setIsFormOpen(false);
      setForm(EMPTY_FORM);
      setPicture(null);
      setEditingId(null);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save dependent");
    } finally {
      setIsSaving(false);
    }
  };

  const choosePicture = async () => {
    setError("");
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Allow photo-library access to choose a dependent picture.");
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
    setPicture({
      uri: asset.uri,
      name: asset.fileName || `dependent-${Date.now()}.jpg`,
      mimeType: asset.mimeType || "image/jpeg",
      file: asset.file,
    });
  };

  const handleDelete = (dependent: Dependent) => {
    Alert.alert(
      `Remove ${displayName(dependent)}?`,
      "This permanently removes the dependent from your plan account.",
      [
        { text: "Keep dependent", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDependent(dependent.id);
              setSelected(null);
              await load(true);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Unable to remove dependent");
            }
          },
        },
      ]
    );
  };

  return (
    <VStack className="flex-1 bg-slate-50">
      <ScreenHeader
        eyebrow="Family cover"
        title="Dependents"
        description="Add family members, update their details, and review care history."
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerClassName="gap-4 px-5 py-5"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void load(true)} />}
      >
        <TouchableOpacity onPress={openCreate} className="flex-row items-center justify-center gap-2 rounded-2xl bg-primary-700 px-5 py-4">
          <Plus color="#ffffff" size={20} />
          <Text className="font-semibold text-white">Add a dependent</Text>
        </TouchableOpacity>
        {isLoading ? <ActivityIndicator color="#1e63e9" /> : null}
        {error && !isFormOpen ? (
          <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
            <Text className="text-sm text-error-700">{error}</Text>
          </Box>
        ) : null}
        {!isLoading && !error && dependents.length === 0 ? (
          <Box className="items-center rounded-[24px] border border-dashed border-slate-200 bg-white p-8">
            <UserRound color="#64748b" size={30} />
            <Text className="mt-3 font-semibold text-typography-900">No dependents added</Text>
            <Text className="mt-1 text-center text-sm text-typography-500">Add an eligible family member to start managing their cover.</Text>
          </Box>
        ) : null}
        {dependents.map((dependent) => (
          <TouchableOpacity key={dependent.id} onPress={() => void openDetails(dependent)} activeOpacity={0.8}>
            <HStack className="items-center rounded-[24px] border border-slate-100 bg-white p-5">
              {resolvePictureUrl(dependent.pictureUrl || dependent.picture) ? (
                <Image
                  source={{ uri: resolvePictureUrl(dependent.pictureUrl || dependent.picture) || "" }}
                  className="mr-3 h-12 w-12 rounded-full bg-primary-50"
                />
              ) : (
                <Box className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-primary-50">
                  <Text className="text-lg font-bold text-primary-800">
                    {`${dependent.firstName?.[0] || ""}${dependent.lastName?.[0] || ""}`.toUpperCase() || "D"}
                  </Text>
                </Box>
              )}
              <VStack className="flex-1" space="xs">
                <Text className="font-bold text-typography-900">{displayName(dependent)}</Text>
                <Text className="text-sm capitalize text-typography-500">
                  {dependent.relationshipToEnrollee || "Relationship not set"}
                </Text>
                <Text className="text-xs font-semibold text-primary-800">{dependent.policyNumber || "Policy pending"}</Text>
              </VStack>
              <Box className={`rounded-full px-3 py-1 ${dependent.isActive === false ? "bg-slate-100" : "bg-emerald-50"}`}>
                <Text className={`text-xs font-semibold ${dependent.isActive === false ? "text-slate-600" : "text-emerald-700"}`}>
                  {dependent.isActive === false ? "Inactive" : "Active"}
                </Text>
              </Box>
            </HStack>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={Boolean(selected)} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="max-h-[90%] rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <HStack className="items-center justify-between">
              <VStack className="flex-1" space="xs">
                <Text className="text-xs font-semibold uppercase tracking-widest text-primary-700">Dependent profile</Text>
                <Text className="text-2xl font-bold text-typography-900">{selected ? displayName(selected) : ""}</Text>
              </VStack>
              <TouchableOpacity onPress={() => setSelected(null)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <ScrollView className="mt-5" contentContainerClassName="gap-4 pb-6">
              <HStack className="gap-3">
                <TouchableOpacity onPress={() => selected && openEdit(selected)} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-primary-50 py-3">
                  <Pencil color="#1d4ed8" size={17} />
                  <Text className="font-semibold text-primary-800">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => selected && handleDelete(selected)} className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-error-50 py-3">
                  <Trash2 color="#b91c1c" size={17} />
                  <Text className="font-semibold text-error-700">Remove</Text>
                </TouchableOpacity>
              </HStack>
              <VStack className="rounded-[24px] bg-slate-50 p-5" space="md">
                {resolvePictureUrl(selected?.pictureUrl || selected?.picture) ? (
                  <Image
                    source={{ uri: resolvePictureUrl(selected?.pictureUrl || selected?.picture) || "" }}
                    className="mb-2 h-24 w-24 self-center rounded-full bg-white"
                  />
                ) : null}
                {[
                  ["Policy number", selected?.policyNumber || "Pending"],
                  ["Relationship", selected?.relationshipToEnrollee || "Not recorded"],
                  ["Date of birth", formatDate(selected?.dateOfBirth)],
                  ["Phone", selected?.phoneNumber || "Not recorded"],
                  ["Email", selected?.email || "Not recorded"],
                  ["Occupation", selected?.occupation || "Not recorded"],
                  ["Marital status", selected?.maritalStatus || "Not recorded"],
                  ["Pre-existing records", selected?.preexistingMedicalRecords || "None recorded"],
                ].map(([label, value]) => (
                  <VStack key={label} space="xs">
                    <Text className="text-xs font-semibold uppercase text-typography-400">{label}</Text>
                    <Text className="font-semibold capitalize text-typography-800">{value}</Text>
                  </VStack>
                ))}
              </VStack>
              <HStack className="items-center" space="sm">
                <FileHeart color="#1d4ed8" size={20} />
                <Text className="text-lg font-bold text-typography-900">Medical history</Text>
              </HStack>
              {!canViewDependentHistory ? (
                <Box className="rounded-2xl border border-primary-100 bg-primary-50 p-4">
                  <Text className="text-sm leading-5 text-primary-900">
                    Enable dependent visit updates in More to view dependent medical history.
                  </Text>
                </Box>
              ) : null}
              {isLoadingHistory ? <ActivityIndicator color="#1e63e9" /> : null}
              {canViewDependentHistory && !isLoadingHistory && histories.length === 0 ? (
                <Text className="text-sm text-typography-500">No visible medical history for this dependent.</Text>
              ) : null}
              {histories.map((record) => (
                <Box key={record.id} className="rounded-2xl border border-slate-100 p-4">
                  <Text className="font-semibold text-typography-900">{record.Diagnosis?.name || record.notes || "Clinical visit"}</Text>
                  <Text className="mt-1 text-sm text-typography-500">{record.Provider?.name || "Healthcare provider"} · {formatDate(record.serviceDate)}</Text>
                </Box>
              ))}
            </ScrollView>
          </VStack>
        </Box>
      </Modal>

      <Modal visible={isFormOpen} transparent animationType="slide" onRequestClose={() => setIsFormOpen(false)}>
        <Box className="flex-1 justify-end bg-black/40">
          <VStack className="max-h-[92%] rounded-t-[32px] bg-white px-5 pt-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
            <HStack className="items-center justify-between">
              <VStack>
                <Text className="text-xl font-bold text-typography-900">{editingId ? "Update dependent" : "Add dependent"}</Text>
                <Text className="mt-1 text-sm text-typography-500">Keep family information accurate and up to date.</Text>
              </VStack>
              <TouchableOpacity onPress={() => setIsFormOpen(false)} className="h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <X color="#334155" size={20} />
              </TouchableOpacity>
            </HStack>
            <ScrollView className="mt-5" contentContainerClassName="gap-4 pb-6" keyboardShouldPersistTaps="handled">
              {error ? (
                <Box className="rounded-2xl border border-error-200 bg-error-50 p-4">
                  <Text className="text-sm text-error-700">{error}</Text>
                </Box>
              ) : null}
              <TouchableOpacity
                onPress={() => void choosePicture()}
                className="items-center rounded-[24px] border border-dashed border-primary-200 bg-primary-50 p-5"
              >
                {picture?.uri ? (
                  <Image
                    source={{ uri: picture.uri }}
                    className="h-24 w-24 rounded-full bg-white"
                  />
                ) : (
                  <Box className="h-20 w-20 items-center justify-center rounded-full bg-white">
                    <Camera color="#1d4ed8" size={26} />
                  </Box>
                )}
                <Text className="mt-3 font-semibold text-primary-800">
                  {picture?.uri ? "Picture selected" : "Add or change picture"}
                </Text>
              </TouchableOpacity>
              {([
                ["First name", "firstName", "Ada"],
                ["Middle name", "middleName", "Optional"],
                ["Last name", "lastName", "Okafor"],
                ["Date of birth", "dateOfBirth", "2015-04-28"],
                ["Phone number", "phoneNumber", "Optional"],
                ["Email", "email", "Optional"],
                ["Occupation", "occupation", "Optional"],
              ] as const).map(([label, key, placeholder]) => (
                <VStack key={key} space="xs">
                  <Text className="text-sm font-semibold text-typography-700">{label}</Text>
                  <TextInput
                    value={form[key]}
                    onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
                    placeholder={placeholder}
                    placeholderTextColor="#94a3b8"
                    autoCapitalize={key === "email" ? "none" : "sentences"}
                    keyboardType={key === "email" ? "email-address" : key === "phoneNumber" ? "phone-pad" : "default"}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                  />
                </VStack>
              ))}
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Gender</Text>
                <HStack className="gap-2">
                  {(["male", "female", "other"] as const).map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      onPress={() => setForm((current) => ({ ...current, gender }))}
                      className={`flex-1 items-center rounded-full border py-3 ${form.gender === gender ? "border-primary-700 bg-primary-50" : "border-slate-200"}`}
                    >
                      <Text className={`capitalize ${form.gender === gender ? "font-semibold text-primary-800" : "text-typography-600"}`}>{gender}</Text>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Relationship</Text>
                <HStack className="flex-wrap gap-2">
                  {["spouse", "child", "parent", "sibling", "other"].map((relationship) => (
                    <TouchableOpacity
                      key={relationship}
                      onPress={() => setForm((current) => ({ ...current, relationshipToEnrollee: relationship }))}
                      className={`rounded-full border px-4 py-3 ${form.relationshipToEnrollee === relationship ? "border-primary-700 bg-primary-50" : "border-slate-200"}`}
                    >
                      <Text className={`capitalize ${form.relationshipToEnrollee === relationship ? "font-semibold text-primary-800" : "text-typography-600"}`}>{relationship}</Text>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Marital status</Text>
                <HStack className="flex-wrap gap-2">
                  {["single", "married", "divorced", "widowed"].map((status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => setForm((current) => ({ ...current, maritalStatus: status }))}
                      className={`rounded-full border px-4 py-3 ${form.maritalStatus === status ? "border-primary-700 bg-primary-50" : "border-slate-200"}`}
                    >
                      <Text className={`capitalize ${form.maritalStatus === status ? "font-semibold text-primary-800" : "text-typography-600"}`}>{status}</Text>
                    </TouchableOpacity>
                  ))}
                </HStack>
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Pre-existing medical records</Text>
                <TextInput
                  value={form.preexistingMedicalRecords}
                  onChangeText={(preexistingMedicalRecords) => setForm((current) => ({ ...current, preexistingMedicalRecords }))}
                  placeholder="Medical conditions or records, if any"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-24 rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                />
              </VStack>
              <VStack space="xs">
                <Text className="text-sm font-semibold text-typography-700">Notes</Text>
                <TextInput
                  value={form.notes}
                  onChangeText={(notes) => setForm((current) => ({ ...current, notes }))}
                  placeholder="Optional medical or care notes"
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                  className="min-h-24 rounded-2xl border border-slate-200 px-4 py-4 text-typography-900"
                />
              </VStack>
              <TouchableOpacity onPress={() => void handleSave()} disabled={isSaving} className="items-center rounded-2xl bg-primary-700 py-4">
                {isSaving ? <ActivityIndicator color="#ffffff" /> : <Text className="font-semibold text-white">{editingId ? "Save changes" : "Add dependent"}</Text>}
              </TouchableOpacity>
            </ScrollView>
          </VStack>
        </Box>
      </Modal>
    </VStack>
  );
}
