import { create } from "zustand";

export interface Provider {
  id: string;
  name: string;
  code: string;
  email: string;
}

export interface Service {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  requiresPreauthorization: boolean;
  priceType: "fixed" | "rate";
  fixedPrice?: number | null;
  rateType?:
    | "per_session"
    | "per_visit"
    | "per_hour"
    | "per_day"
    | "per_week"
    | "per_month"
    | "per_consultation"
    | "per_procedure"
    | "per_unit"
    | "per_mile"
    | null;
  rateAmount?: number | null;
  price?: number | null; // kept for backwards compatibility
  status: "active" | "inactive" | "pending";
  isDeleted?: boolean;
  providerId: string;
  provider?: Provider;
  createdAt?: string;
  updatedAt?: string;
}

type ServiceState = {
  services: Service[];
  setServices: (items: Service[]) => void;
  addService: (item: Service) => void;
  updateService: (id: string, patch: Partial<Service>) => void;
  removeService: (id: string) => void;
  clear: () => void;
};

export const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  setServices: (items) => set({ services: items }),
  addService: (item) =>
    set((state) => ({ services: [item, ...state.services] })),
  updateService: (id, patch) =>
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, ...patch } : s
      ),
    })),
  removeService: (id) =>
    set((state) => ({ services: state.services.filter((s) => s.id !== id) })),
  clear: () => set({ services: [] }),
}));
