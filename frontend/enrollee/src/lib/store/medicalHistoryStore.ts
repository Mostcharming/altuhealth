import { create } from "zustand";

export interface Provider {
  id: string;
  name: string;
  code?: string;
  category?: string;
  status?: string;
  email?: string;
  phoneNumber?: string;
  state?: string;
  lga?: string;
  address?: string;
}

export interface Diagnosis {
  id: string;
  name: string;
  code?: string;
  description?: string;
}

export interface MedicalHistory {
  id: string;
  enrolleeId: string;
  providerId?: string | null;
  diagnosisId?: string | null;
  evsCode?: string | null;
  amount?: number | null;
  serviceDate?: string | null;
  notes?: string | null;
  attachmentUrl?: string | null;
  status: "pending" | "reviewed" | "approved" | "rejected";
  currency: string;
  createdAt?: string;
  updatedAt?: string;
  Provider?: Provider;
  Diagnosis?: Diagnosis;
}

type MedicalHistoryState = {
  medicalHistories: MedicalHistory[];
  setMedicalHistories: (items: MedicalHistory[]) => void;
  addMedicalHistory: (item: MedicalHistory) => void;
  updateMedicalHistory: (id: string, patch: Partial<MedicalHistory>) => void;
  removeMedicalHistory: (id: string) => void;
  clear: () => void;
};

export const useMedicalHistoryStore = create<MedicalHistoryState>((set) => ({
  medicalHistories: [],
  setMedicalHistories: (items: MedicalHistory[]) =>
    set({ medicalHistories: items }),
  addMedicalHistory: (item: MedicalHistory) =>
    set((state) => ({ medicalHistories: [...state.medicalHistories, item] })),
  updateMedicalHistory: (id: string, patch: Partial<MedicalHistory>) =>
    set((state) => ({
      medicalHistories: state.medicalHistories.map((mh) =>
        mh.id === id ? { ...mh, ...patch } : mh
      ),
    })),
  removeMedicalHistory: (id: string) =>
    set((state) => ({
      medicalHistories: state.medicalHistories.filter((mh) => mh.id !== id),
    })),
  clear: () => set({ medicalHistories: [] }),
}));
