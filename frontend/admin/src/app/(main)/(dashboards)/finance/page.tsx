import FinanceDashboardContent from "@/components/saas/FinanceDashboardContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin - Finance Dashboard",
  description: "This is the AltuHealth Admin - Finance Dashboard page",
};

export default function SaaS() {
  return <FinanceDashboardContent />;
}
