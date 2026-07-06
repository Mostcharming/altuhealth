import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import JobTable from "@/components/pages/jobs/jobTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin Jobs",
  description: "Manage jobs within the AltuHealth admin panel.",
};

export default function Jobs() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Scheduled Jobs" />
      <JobTable />
    </div>
  );
}
