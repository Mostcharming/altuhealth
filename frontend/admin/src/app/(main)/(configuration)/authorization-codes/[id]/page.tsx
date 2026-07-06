import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AuthorizationCodeDetailsPage from "@/components/pages/authorizationCodes/single/AuthorizationCodeDetailsPage";
import { Metadata } from "next";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export const metadata: Metadata = {
  title: "AltuHealth Admin Authorization Code Details",
  description: "Review authorization code details and line items.",
};

export default async function AuthorizationCodeDetails({ params }: Props) {
  const { id } = await params;

  return (
    <div>
      <PageBreadcrumb pageTitle="Authorization Code Details" />
      <AuthorizationCodeDetailsPage id={id} />
    </div>
  );
}
