import {
  CalendarDays,
  CircleHelp,
  HeartPulse,
  Hospital,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  UserRoundPlus,
} from "lucide-react-native";

export const enrolleeStats = [
  { label: "Plan status", value: "Active" },
  { label: "Dependents", value: "2" },
  { label: "Appointments", value: "1" },
  { label: "Open tickets", value: "0" },
];

export const quickActions = [
  {
    title: "Book appointment",
    description: "Request a visit with a provider.",
    route: "/appointments",
    icon: CalendarDays,
  },
  {
    title: "View benefits",
    description: "Check available enrollee cover.",
    route: "/benefits",
    icon: ShieldCheck,
  },
  {
    title: "Medical history",
    description: "Keep clinical records close.",
    route: "/medical-history",
    icon: HeartPulse,
  },
];

export const moreFeatures = [
  {
    title: "Dependents",
    description: "Manage family members on your plan.",
    route: "/dependents",
    icon: UserRoundPlus,
  },
  {
    title: "Hospital list",
    description: "Find approved care providers.",
    route: "/hospital-list",
    icon: Hospital,
  },
  {
    title: "Women's health",
    description: "Access dedicated women's health support.",
    route: "/womens-health",
    icon: HeartPulse,
  },
  {
    title: "Consult a doctor",
    description: "Start a consultation request.",
    route: "/doctor-consultation",
    icon: Stethoscope,
  },
  {
    title: "Support messages",
    description: "Track conversations with support.",
    route: "/support-messages",
    icon: MessageCircle,
  },
  {
    title: "Help center",
    description: "Get answers about your enrollee account.",
    route: "/support-messages",
    icon: CircleHelp,
  },
];

export const appointments = [
  {
    title: "General consultation",
    meta: "Lagos Care Hospital",
    status: "Pending",
  },
  {
    title: "Dental check",
    meta: "Provider to be assigned",
    status: "Request",
  },
];

export const benefitGroups = [
  "Primary care",
  "Specialist consultation",
  "Prescriptions",
  "Diagnostics",
  "Emergency care",
];
