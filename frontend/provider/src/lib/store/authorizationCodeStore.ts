import { create } from "zustand";

export interface AuthorizationCode {
  id: string;
  authorizationCode: string;
  enrolleeId: string;
  enrollee?: {
    firstName: string;
    lastName: string;
    policyNumber: string;
  };
  providerId?: string;
  provider?: {
    name: string;
    code: string;
  };
  diagnosisId?: string;
  diagnosis?: {
    name: string;
    code: string;
  };
  companyId: string;
  company?: {
    name: string;
  };
  companyPlanId?: string;
  authorizationType: string;
  validFrom: string;
  validTo: string;
  amountAuthorized?: number;
  reasonForCode?: string;
  approvalNote?: string;
  notes?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

type AuthorizationCodeState = {
  authorizationCodes: AuthorizationCode[];
  setAuthorizationCodes: (items: AuthorizationCode[]) => void;
  addAuthorizationCode: (item: AuthorizationCode) => void;
  updateAuthorizationCode: (
    id: string,
    patch: Partial<AuthorizationCode>
  ) => void;
  removeAuthorizationCode: (id: string) => void;
  clear: () => void;
};

export const useAuthorizationCodeStore = create<AuthorizationCodeState>(
  (set) => ({
    authorizationCodes: [],
    setAuthorizationCodes: (items) => set({ authorizationCodes: items }),
    addAuthorizationCode: (item) =>
      set((state) => ({
        authorizationCodes: [item, ...state.authorizationCodes],
      })),
    updateAuthorizationCode: (id, patch) =>
      set((state) => ({
        authorizationCodes: state.authorizationCodes.map((ac) =>
          ac.id === id ? { ...ac, ...patch } : ac
        ),
      })),
    removeAuthorizationCode: (id) =>
      set((state) => ({
        authorizationCodes: state.authorizationCodes.filter(
          (ac) => ac.id !== id
        ),
      })),
    clear: () => set({ authorizationCodes: [] }),
  })
);
