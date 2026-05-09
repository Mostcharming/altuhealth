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
  profilePicture?: File;
}) {
  // If there's a file, use FormData for multipart/form-data
  if (data.profilePicture) {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("dateOfBirth", data.dateOfBirth);
    formData.append("gender", data.gender);
    formData.append("relationshipToEnrollee", data.relationshipToEnrollee);

    if (data.middleName) formData.append("middleName", data.middleName);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.email) formData.append("email", data.email);
    if (data.occupation) formData.append("occupation", data.occupation);
    if (data.maritalStatus)
      formData.append("maritalStatus", data.maritalStatus);
    if (data.preexistingMedicalRecords)
      formData.append(
        "preexistingMedicalRecords",
        data.preexistingMedicalRecords,
      );
    if (data.notes) formData.append("notes", data.notes);

    formData.append("picture", data.profilePicture);

    return apiClient("/enrollee/dependents", {
      method: "POST",
      body: formData,
    });
  }

  // Otherwise use JSON
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
