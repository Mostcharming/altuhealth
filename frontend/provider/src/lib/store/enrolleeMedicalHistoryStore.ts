import { create } from "zustand";

export interface EnrolleeMedicalHistory {
  id: string;
  enrolleeId: string;
  providerId?: string;
  diagnosisId?: string;
  evsCode?: string;
  amount?: number;
  serviceDate?: string;
  notes?: string;
  attachmentUrl?: string;
  status: "pending" | "reviewed" | "approved" | "rejected";
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

type EnrolleeMedicalHistoryState = {
  medicalHistories: EnrolleeMedicalHistory[];
  setMedicalHistories: (items: EnrolleeMedicalHistory[]) => void;
  addMedicalHistory: (item: EnrolleeMedicalHistory) => void;
  updateMedicalHistory: (
    id: string,
    patch: Partial<EnrolleeMedicalHistory>
  ) => void;
  removeMedicalHistory: (id: string) => void;
  clear: () => void;
};

export const useEnrolleeMedicalHistoryStore =
  create<EnrolleeMedicalHistoryState>((set) => ({
    medicalHistories: [],
    setMedicalHistories: (items) => set({ medicalHistories: items }),
    addMedicalHistory: (item) =>
      set((state) => ({
        medicalHistories: [item, ...state.medicalHistories],
      })),
    updateMedicalHistory: (id, patch) =>
      set((state) => ({
        medicalHistories: state.medicalHistories.map((m) =>
          m.id === id ? { ...m, ...patch } : m
        ),
      })),
    removeMedicalHistory: (id) =>
      set((state) => ({
        medicalHistories: state.medicalHistories.filter((m) => m.id !== id),
      })),
    clear: () => set({ medicalHistories: [] }),
  }));
