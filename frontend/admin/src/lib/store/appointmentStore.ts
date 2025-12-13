import { create } from "zustand";

export interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  policyNumber?: string;
}

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

export interface Company {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface CompanySubsidiary {
  id: string;
  name: string;
}

export interface Admin {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Appointment {
  id: string;
  enrolleeId: string;
  providerId: string;
  companyId: string;
  subsidiaryId?: string | null;
  complaint?: string | null;
  appointmentDateTime: string;
  approvedBy?: string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "attended"
    | "missed"
    | "cancelled"
    | "rescheduled";
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  Enrollee?: Enrollee;
  Provider?: Provider;
  Company?: Company;
  subsidiary?: CompanySubsidiary;
  approver?: Admin;
  rejector?: Admin;
}

type AppointmentState = {
  appointments: Appointment[];
  setAppointments: (items: Appointment[]) => void;
  addAppointment: (item: Appointment) => void;
  updateAppointment: (id: string, patch: Partial<Appointment>) => void;
  removeAppointment: (id: string) => void;
  clear: () => void;
};

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  setAppointments: (items: Appointment[]) => set({ appointments: items }),
  addAppointment: (item: Appointment) =>
    set((state) => ({ appointments: [...state.appointments, item] })),
  updateAppointment: (id: string, patch: Partial<Appointment>) =>
    set((state) => ({
      appointments: state.appointments.map((ap) =>
        ap.id === id ? { ...ap, ...patch } : ap
      ),
    })),
  removeAppointment: (id: string) =>
    set((state) => ({
      appointments: state.appointments.filter((ap) => ap.id !== id),
    })),
  clear: () => set({ appointments: [] }),
}));
