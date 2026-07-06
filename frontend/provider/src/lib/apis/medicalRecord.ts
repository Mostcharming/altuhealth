import { apiClient } from "@/lib/apiClient";

export type MedicalRecordMemberType =
  | "enrollee"
  | "dependent"
  | "retail_enrollee"
  | "retail_dependent";

export type MedicalRecord = {
  id: string;
  memberType: MedicalRecordMemberType;
  member: {
    id: string;
    firstName?: string;
    lastName?: string;
    policyNumber?: string;
    email?: string;
    phoneNumber?: string;
  } | null;
  provider?: {
    id: string;
    name?: string;
    code?: string;
    email?: string;
  } | null;
  diagnosis?: {
    id: string;
    name?: string;
    severity?: string;
  } | null;
  evsCode?: string | null;
  amount?: string | number | null;
  serviceDate?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
  status?: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchProviderMedicalRecords(query?: string) {
  const params = new URLSearchParams();
  if (query) params.append("query", query);

  return apiClient(`/provider/medical-records?${params.toString()}`, {
    method: "GET",
  });
}

export async function getProviderMedicalRecord(
  id: string,
  type: MedicalRecordMemberType,
) {
  const params = new URLSearchParams({ type });

  return apiClient(`/provider/medical-records/${id}?${params.toString()}`, {
    method: "GET",
  });
}
