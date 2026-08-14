const MOBILE_NOTIFICATION_ROUTES = [
  ["dependent-medical-history", "/dependents"],
  ["appointments", "/appointments"],
  ["benefits", "/benefits"],
  ["medical-history", "/medical-history"],
  ["dependents", "/dependents"],
  ["hospital-list", "/hospital-list"],
  ["support-messages", "/support-messages"],
  ["womens-health", "/womens-health"],
  ["doctor-consultation", "/doctor-consultation"],
] as const;

export function isRetailEnrollee(type?: string | null) {
  return type === "RetailEnrollee";
}

export function resolveNotificationRoute(clickUrl?: string | null) {
  if (!clickUrl || clickUrl === "#") return null;
  const normalized = clickUrl.toLowerCase();
  const route = MOBILE_NOTIFICATION_ROUTES.find(([candidate]) =>
    normalized.includes(candidate)
  );
  return route?.[1] || null;
}

export function validatePasswordChange(input: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  if (!input.oldPassword || !input.newPassword) {
    return "Enter your current and new password.";
  }
  if (input.newPassword.length < 8) {
    return "Your new password must be at least 8 characters.";
  }
  if (input.newPassword !== input.confirmPassword) {
    return "New password and confirmation do not match.";
  }
  return null;
}
