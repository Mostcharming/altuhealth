import AnalyticsDashboardContent from "@/components/crm/AnalyticsDashboardContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Analytics Dashboard",
  description: "Analytics dashboard overview for AltuHealth platform.",
};

export default function Crm() {
  return <AnalyticsDashboardContent />;
}
