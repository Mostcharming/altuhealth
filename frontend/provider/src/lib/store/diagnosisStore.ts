import { create } from "zustand";

export interface Diagnosis {
  id: string;
  name: string;
  description?: string | null;
  severity?: "mild" | "moderate" | "severe" | "critical" | null;
  symptoms?: string | null;
  treatment?: string | null;
  isChronicCondition: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type DiagnosisState = {
  diagnoses: Diagnosis[];
  setDiagnoses: (items: Diagnosis[]) => void;
  addDiagnosis: (item: Diagnosis) => void;
  updateDiagnosis: (id: string, patch: Partial<Diagnosis>) => void;
  removeDiagnosis: (id: string) => void;
  clear: () => void;
};

export const useDiagnosisStore = create<DiagnosisState>((set) => ({
  diagnoses: [],
  setDiagnoses: (items) => set({ diagnoses: items }),
  addDiagnosis: (item) =>
    set((state) => ({ diagnoses: [item, ...state.diagnoses] })),
  updateDiagnosis: (id, patch) =>
    set((state) => ({
      diagnoses: state.diagnoses.map((d) =>
        d.id === id ? { ...d, ...patch } : d
      ),
    })),
  removeDiagnosis: (id) =>
    set((state) => ({ diagnoses: state.diagnoses.filter((d) => d.id !== id) })),
  clear: () => set({ diagnoses: [] }),
}));
