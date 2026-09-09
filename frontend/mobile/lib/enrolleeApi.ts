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
    renewalDate?: string | null;
    name?: string | null;
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
  rejectionReason?: string;
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
  benefitCategoryId?: string;
  isCovered?: boolean;
};

export type MedicalHistoryRecord = {
  id: string;
  notes?: string;
  serviceDate?: string;
  status?: string;
  evsCode?: string;
  serviceType?: string;
  amount?: string | number;
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
  middleName?: string;
  lastName?: string;
  relationshipToEnrollee?: string;
  policyNumber?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  email?: string;
  occupation?: string;
  maritalStatus?: string;
  preexistingMedicalRecords?: string;
  notes?: string;
  picture?: string;
  pictureUrl?: string;
  isActive?: boolean;
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
  categoryLabel?: string;
  type?: string;
  website?: string;
  specialization?: { name?: string } | null;
};

export type Ticket = {
  id: string;
  ticketNumber?: number;
  subject?: string;
  category?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
  description?: string;
  messages?: TicketMessage[];
};

export type TicketMessage = {
  id: string;
  content?: string;
  senderType?: string;
  messageType?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt?: string;
};

export type PeriodTracker = {
  id?: string;
  lastPeriodDate?: string;
  cycleLength?: number;
  periodDuration?: number;
  notes?: string;
};

export type HealaConfig = {
  name?: string;
  webLink?: string;
  environment?: string;
};

export type Profile = {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  policyNumber?: string;
  state?: string;
  lga?: string;
  country?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  currentLocation?: string;
  latitude?: number | null;
  longitude?: number | null;
  picture?: string;
  pictureUrl?: string;
  type?: string;
  dependentVisitNotificationsEnabled?: boolean | null;
  requiresDependentVisitSetup?: boolean;
};

export type UploadImage = {
  uri: string;
  name?: string;
  mimeType?: string;
  file?: File;
};

export type EnrolleeNotification = {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  source?: string;
  notificationType?: string;
  clickUrl?: string;
  picture?: string;
  isRead?: boolean;
  createdAt?: string;
};

export type DependentVisitPreference = {
  dependentVisitNotificationsEnabled: boolean | null;
  requiresDependentVisitSetup: boolean;
};

export type AccountDeletionRequest = {
  id: string;
  reason: string;
  status: "pending" | "approved" | "declined" | "cancelled" | "archived";
  adminNote?: string | null;
  retentionExpiresAt?: string | null;
  retentionDaysRemaining?: number | null;
  canCancel: boolean;
  createdAt: string;
};

export type SubscriptionPlan = {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  planCycle?: string;
  amount?: number;
  currency?: string;
  allowDependentEnrolee?: boolean;
  maxNumberOfDependents?: number;
};

export type RetailSubscription = {
  id: string;
  referenceNumber?: string;
  planId?: string;
  plan?: SubscriptionPlan | null;
  planCycle?: string;
  amountPaid?: number;
  currency?: string;
  datePaid?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  status?: string;
  isRenewal?: boolean;
};

export type SubscriptionOverview = {
  current?: RetailSubscription | null;
  history?: RetailSubscription[];
  plans?: SubscriptionPlan[];
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

function buildFormData(
  fields: Record<string, unknown>,
  picture: UploadImage
) {
  const formData = new FormData();

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (picture.file) {
    formData.append("picture", picture.file, picture.name || picture.file.name);
  } else {
    formData.append(
      "picture",
      {
        uri: picture.uri,
        name: picture.name || `profile-${Date.now()}.jpg`,
        type: picture.mimeType || "image/jpeg",
      } as unknown as Blob
    );
  }

  return formData;
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

export async function getAppointment(id: string) {
  return getData<Appointment>(await apiClient(`/enrollee/appointments/${id}`));
}

export async function createAppointment(data: {
  providerId: string;
  complaint?: string;
  appointmentDateTime: string;
  notes?: string;
}) {
  return getData<{ appointment: Appointment }>(
    await apiClient("/enrollee/appointments", { method: "POST", body: data })
  ).appointment;
}

export async function cancelAppointment(id: string) {
  return getData<{ appointment: Appointment }>(
    await apiClient(`/enrollee/appointments/${id}/cancel`, { method: "PATCH" })
  ).appointment;
}

export async function fetchBenefits() {
  const data = getData<{ benefits?: Benefit[] }>(
    await apiClient("/enrollee/benefits/list?limit=100")
  );
  return data?.benefits || [];
}

export async function getBenefit(id: string) {
  return getData<Benefit>(await apiClient(`/enrollee/benefits/${id}`));
}

export async function fetchMedicalHistory() {
  const data = getData<{ list?: MedicalHistoryRecord[] }>(
    await apiClient("/enrollee/medical-history/list?limit=all")
  );
  return data?.list || [];
}

export async function getMedicalHistoryRecord(id: string) {
  return getData<MedicalHistoryRecord>(
    await apiClient(`/enrollee/medical-history/${id}`)
  );
}

export async function fetchDependents() {
  const data = getData<{ list?: Dependent[] }>(
    await apiClient("/enrollee/dependents/list?limit=all")
  );
  return data?.list || [];
}

export async function getDependent(id: string) {
  return getData<Dependent>(await apiClient(`/enrollee/dependents/${id}`));
}

export async function createDependent(data: {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  relationshipToEnrollee: string;
  phoneNumber?: string;
  email?: string;
  occupation?: string;
  maritalStatus?: string;
  preexistingMedicalRecords?: string;
  notes?: string;
  picture?: UploadImage | null;
}) {
  const { picture, ...fields } = data;
  const formData = picture ? buildFormData(fields, picture) : undefined;
  return getData<{ dependent: Dependent }>(
    await apiClient("/enrollee/dependents", {
      method: "POST",
      body: formData ? undefined : fields,
      formData,
    })
  ).dependent;
}

export async function updateDependent(
  id: string,
  data: Partial<Dependent>,
  picture?: UploadImage | null
) {
  const formData = picture ? buildFormData(data, picture) : undefined;
  return getData<{ dependent: Dependent }>(
    await apiClient(`/enrollee/dependents/${id}`, {
      method: "PUT",
      body: formData ? undefined : data,
      formData,
    })
  ).dependent;
}

export async function deleteDependent(id: string) {
  return apiClient(`/enrollee/dependents/${id}`, { method: "DELETE" });
}

export async function fetchDependentMedicalHistory(id: string) {
  const data = getData<{ list?: MedicalHistoryRecord[] }>(
    await apiClient(`/enrollee/dependents/${id}/medical-histories?limit=all`)
  );
  return data?.list || [];
}

export async function fetchProviders() {
  const data = getData<{ list?: Provider[] }>(
    await apiClient("/public/providers")
  );
  return data?.list || [];
}

export async function fetchTickets() {
  const data = getData<{ list?: Ticket[] }>(
    await apiClient("/enrollee/tickets?limit=20")
  );
  return data?.list || [];
}

export async function createTicket(data: {
  subject: string;
  description?: string;
  category?: string;
  priority?: string;
}) {
  return getData<{ ticket: Ticket }>(
    await apiClient("/enrollee/tickets", { method: "POST", body: data })
  ).ticket;
}

export async function getTicket(id: string) {
  return getData<{ ticket: Ticket }>(
    await apiClient(`/enrollee/tickets/${id}`)
  ).ticket;
}

export async function addTicketMessage(id: string, content: string) {
  return getData<{ message: TicketMessage }>(
    await apiClient(`/enrollee/tickets/${id}/messages`, {
      method: "POST",
      body: { content, messageType: "text" },
    })
  ).message;
}

export async function fetchPeriodTracker() {
  return getData<PeriodTracker | null>(
    await apiClient("/enrollee/womens-health/tracker")
  );
}

export async function savePeriodTracker(data: {
  lastPeriodDate: string;
  cycleLength: number;
  periodDuration: number;
  notes?: string;
}, exists: boolean) {
  return getData<PeriodTracker>(
    await apiClient("/enrollee/womens-health/tracker", {
      method: exists ? "PUT" : "POST",
      body: data,
    })
  );
}

export async function fetchPeriodEvents() {
  return getData<{ id: string; title: string; start: string; end?: string }[]>(
    await apiClient("/enrollee/womens-health/events")
  );
}

export async function fetchHealaConfig() {
  const data = getData<{ heala?: HealaConfig }>(
    await apiClient("/enrollee/integrations/heala")
  );
  return data?.heala || null;
}

export async function fetchProfile() {
  return getData<{ user: Profile }>(
    await apiClient("/enrollee/account/profile")
  ).user;
}

export async function updateProfile(
  data: Partial<Profile>,
  picture?: UploadImage | null
) {
  const formData = picture ? buildFormData(data, picture) : undefined;
  return getData<{ user: Profile }>(
    await apiClient("/enrollee/account/profile", {
      method: "PUT",
      body: formData ? undefined : data,
      formData,
    })
  ).user;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  return apiClient("/enrollee/account/password", {
    method: "POST",
    body: { oldPassword: data.currentPassword, newPassword: data.newPassword },
  });
}

export async function fetchDependentVisitPreference() {
  return getData<DependentVisitPreference>(
    await apiClient("/enrollee/account/dependent-visit-preference")
  );
}

export async function updateDependentVisitPreference(enabled: boolean) {
  return getData<DependentVisitPreference>(
    await apiClient("/enrollee/account/dependent-visit-preference", {
      method: "PUT",
      body: { enabled },
    })
  );
}

export async function fetchAccountDeletionRequest() {
  return getData<{ request?: AccountDeletionRequest | null }>(
    await apiClient("/enrollee/account/deletion-request")
  ).request || null;
}

export async function submitAccountDeletionRequest(reason: string) {
  return getData<{ request: AccountDeletionRequest }>(
    await apiClient("/enrollee/account/deletion-request", {
      method: "POST",
      body: { reason },
    })
  ).request;
}

export async function cancelAccountDeletionRequest() {
  return getData<{ request: AccountDeletionRequest }>(
    await apiClient("/enrollee/account/deletion-request/cancel", {
      method: "POST",
    })
  ).request;
}

export async function fetchNotifications() {
  const payload = getData<{ data?: EnrolleeNotification[] }>(
    await apiClient("/enrollee/notifications/list?limit=50")
  );
  return payload?.data || [];
}

export async function fetchUnreadNotificationCount() {
  const payload = getData<{ unreadCount?: number }>(
    await apiClient("/enrollee/notifications/unread-count")
  );
  return Number(payload?.unreadCount || 0);
}

export async function markNotificationsRead(ids: string[], isRead = true) {
  if (ids.length === 0) return;
  return apiClient("/enrollee/notifications/read", {
    method: "PUT",
    body: ids.length === 1 ? { id: ids[0], isRead } : { ids, isRead },
  });
}

export async function fetchSubscriptionOverview() {
  return getData<SubscriptionOverview>(
    await apiClient("/enrollee/subscriptions")
  );
}

export async function fetchSubscriptionGateways(currency: string) {
  const data = getData<{ gateways?: { provider: string; label: string }[] }>(
    await apiClient(`/enrollee/subscriptions/gateways?currency=${encodeURIComponent(currency)}`)
  );
  return data?.gateways || [];
}

export async function createSubscriptionCheckout(data: {
  planId: string;
  gateway: string;
  returnUrl: string;
}) {
  return getData<{
    gateway: string;
    plan: SubscriptionPlan;
    checkoutUrl: string;
    checkoutReference: string;
  }>(await apiClient("/enrollee/subscriptions/checkout", { method: "POST", body: data }));
}

export async function completeSubscriptionCheckout(data: {
  planId: string;
  gateway: string;
  checkoutReference: string;
  transactionId?: string | null;
  mode: "renew" | "change";
}) {
  return getData<{ subscription: RetailSubscription }>(
    await apiClient("/enrollee/subscriptions/complete", { method: "POST", body: data })
  ).subscription;
}
