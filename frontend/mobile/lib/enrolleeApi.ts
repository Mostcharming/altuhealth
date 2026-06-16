import { apiClient } from "@/lib/apiClient";

export type DashboardMetric = {
  id: string | number;
  title: string;
  value: string;
};

export type DashboardAppointment = {
  id: string;
  title?: string;
  date?: string;
  time?: string;
  doctor?: string;
};

export type DashboardData = {
  enrollee?: {
    firstName?: string;
    lastName?: string;
    policyNumber?: string;
  };
  metrics?: DashboardMetric[];
  healthPlan?: {
    daysUntilRenewal?: number;
    status?: string;
  };
  benefits?: {
    totalBenefits?: string;
    usedPercentage?: number;
    remainingPercentage?: number;
  };
  appointments?: DashboardAppointment[];
};

export type Appointment = {
  id: string;
  complaint?: string;
  notes?: string;
  appointmentDateTime?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  Provider?: {
    name?: string;
  };
};

export type Benefit = {
  id: string;
  name?: string;
  description?: string;
  benefitCategory?: string;
  coverageType?: string;
  coverageValue?: string | number;
  isCovered?: boolean;
};

export type MedicalHistoryRecord = {
  id: string;
  notes?: string;
  serviceDate?: string;
  status?: string;
  evsCode?: string;
  Provider?: {
    name?: string;
  };
  Diagnosis?: {
    name?: string;
    description?: string;
  };
};

export type Dependent = {
  id: string;
  firstName?: string;
  lastName?: string;
  relationshipToEnrollee?: string;
  status?: string;
};

export type Provider = {
  id: string;
  name?: string;
  category?: string;
  state?: string;
  lga?: string;
  address?: string;
  phoneNumber?: string;
};

export type Ticket = {
  id: string;
  ticketNumber?: number;
  subject?: string;
  category?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
};

export type PeriodTracker = {
  id?: string;
  lastPeriodStartDate?: string;
  cycleLength?: number;
  periodLength?: number;
};

function getData<T>(payload: unknown): T {
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload
  ) {
    return (payload as { data?: T }).data as T;
  }

  return payload as T;
}

export async function fetchDashboard() {
  return getData<DashboardData>(await apiClient("/enrollee/dashboard"));
}

export async function fetchAppointments() {
  const data = getData<{ list?: Appointment[] }>(
    await apiClient("/enrollee/appointments/list?limit=all")
  );
  return data?.list || [];
}

export async function fetchBenefits() {
  const data = getData<{ benefits?: Benefit[] }>(
    await apiClient("/enrollee/benefits/list?limit=100")
  );
  return data?.benefits || [];
}

export async function fetchMedicalHistory() {
  const data = getData<{ list?: MedicalHistoryRecord[] }>(
    await apiClient("/enrollee/medical-history/list?limit=all")
  );
  return data?.list || [];
}

export async function fetchDependents() {
  const data = getData<{ list?: Dependent[] }>(
    await apiClient("/enrollee/dependents/list?limit=all")
  );
  return data?.list || [];
}

export async function fetchProviders() {
  const data = getData<{ list?: Provider[] }>(
    await apiClient("/admin/providers/list?limit=20&status=active")
  );
  return data?.list || [];
}

export async function fetchTickets() {
  const data = getData<{ list?: Ticket[] }>(
    await apiClient("/enrollee/tickets?limit=20")
  );
  return data?.list || [];
}

export async function fetchPeriodTracker() {
  return getData<PeriodTracker | null>(
    await apiClient("/enrollee/womens-health/tracker")
  );
}
