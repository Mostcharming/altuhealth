import { apiClient } from "@/lib/apiClient";
import { Dependent } from "@/lib/store/dependentStore";

export async function fetchDependents(params: {
  limit?: number;
  page?: number;
  q?: string;
  status?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.q) queryParams.append("q", params.q);
  if (params.status) queryParams.append("status", params.status);

  return apiClient(`/enrollee/dependents/list?${queryParams.toString()}`, {
    method: "GET",
  });
}

export async function fetchDependentById(id: string) {
  return apiClient(`/enrollee/dependents/${id}`, {
    method: "GET",
  });
}

export async function getDependentById(id: string) {
  return apiClient(`/enrollee/dependents/${id}`, {
    method: "GET",
  });
}

export async function createDependent(data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  relationshipToEnrollee: "spouse" | "child" | "parent" | "sibling" | "other";
  phoneNumber?: string;
  email?: string;
  occupation?: string;
  maritalStatus?: "single" | "married" | "divorced" | "widowed" | "separated";
  preexistingMedicalRecords?: string;
  notes?: string;
}) {
  return apiClient("/enrollee/dependents", {
    method: "POST",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function updateDependent(id: string, data: Partial<Dependent>) {
  return apiClient(`/enrollee/dependents/${id}`, {
    method: "PUT",
    body: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function deleteDependent(id: string) {
  return apiClient(`/enrollee/dependents/${id}`, {
    method: "DELETE",
  });
}
