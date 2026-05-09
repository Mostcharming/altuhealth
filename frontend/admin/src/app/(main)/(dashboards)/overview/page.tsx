import DashboardContent from "@/components/ecommerce/DashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Dashboard",
  description: "Admin dashboard overview for AltuHealth platform.",
};

export default function Ecommerce() {
  return <DashboardContent />;
}
