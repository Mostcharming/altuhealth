import { create } from "zustand";

export interface EnrolleeAuthorizationCode {
  id: string;
  authorizationCode: string;
  enrolleeId: string;
  providerId?: string;
  diagnosisId?: string;
  reason?: string;
  authorizationType:
    | "inpatient"
    | "outpatient"
    | "procedure"
    | "medication"
    | "diagnostic";
  validFrom: string;
  validTo: string;
  amountAuthorized?: number;
  isUsed: boolean;
  usedAt?: string;
  usedAmount?: number;
  status: "active" | "used" | "expired" | "cancelled" | "pending";
  notes?: string;
  Provider?: {
    id: string;
    name: string;
    code: string;
  };
  Diagnosis?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

type EnrolleeAuthorizationCodeState = {
  authorizationCodes: EnrolleeAuthorizationCode[];
  setAuthorizationCodes: (items: EnrolleeAuthorizationCode[]) => void;
  addAuthorizationCode: (item: EnrolleeAuthorizationCode) => void;
  updateAuthorizationCode: (
    id: string,
    patch: Partial<EnrolleeAuthorizationCode>
  ) => void;
  removeAuthorizationCode: (id: string) => void;
  clear: () => void;
};

export const useEnrolleeAuthorizationCodeStore =
  create<EnrolleeAuthorizationCodeState>((set) => ({
    authorizationCodes: [],
    setAuthorizationCodes: (items) => set({ authorizationCodes: items }),
    addAuthorizationCode: (item) =>
      set((state) => ({
        authorizationCodes: [item, ...state.authorizationCodes],
      })),
    updateAuthorizationCode: (id, patch) =>
      set((state) => ({
        authorizationCodes: state.authorizationCodes.map((a) =>
          a.id === id ? { ...a, ...patch } : a
        ),
      })),
    removeAuthorizationCode: (id) =>
      set((state) => ({
        authorizationCodes: state.authorizationCodes.filter((a) => a.id !== id),
      })),
    clear: () => set({ authorizationCodes: [] }),
  }));
