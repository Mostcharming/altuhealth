import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import HospitalListPageClient from "@/components/pages/hospitalList/HospitalListPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Providers List",
  description:
    "View list of affiliated healthcare providers and medical centers.",
};

export default function HospitalListPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Healthcare Providers" />
      <HospitalListPageClient />
    </div>
  );
}
