import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import GlobalTemplate from "@/components/pages/globalTemplate/GlobalTemplate";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Global Template Settings",
  description:
    "Manage global notification templates within the AltuHealth admin panel.",
};

export default function GlobalTemplatePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Global Template" />
      <GlobalTemplate />
    </div>
  );
}
