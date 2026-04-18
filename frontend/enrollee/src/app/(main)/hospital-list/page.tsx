import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import HospitalListPageClient from "@/components/pages/hospitalList/HospitalListPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hospital List",
  description: "View list of affiliated hospitals and medical centers.",
};

export default function HospitalListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Hospital List" />
      <HospitalListPageClient />
    </div>
  );
}
