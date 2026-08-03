"use client";
import Select from "@/components/form/Select";
import ConfirmModal from "@/components/modals/confirm";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import EditEnrolleeModal from "@/components/pages/enrollee/editEnrolleeModal";
import Notification from "@/components/ui/notification/Notification";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { CopyIcon, EyeIcon, MailIcon, PencilIcon } from "@/icons";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { fetchCompanies } from "@/lib/apis/company";
import { fetchCompanyPlans } from "@/lib/apis/companyPlan";
import { fetchEnrollees } from "@/lib/apis/enrollee";
import capitalizeWords from "@/lib/capitalize";
import { formatDate } from "@/lib/formatDate";
import { CompanyPlan } from "@/lib/store/companyPlanStore";
import { Company, useCompanyStore } from "@/lib/store/companyStore";
import { Enrollee, useEnrolleeStore } from "@/lib/store/enrolleeStore";
import { Subscription } from "@/lib/store/subscriptionStore";
import { useRouter } from "next/navigation";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (!text) return false;

  // Prefer the modern clipboard API when available (requires secure context).
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall back to legacy execCommand path below.
    }
  }

  // Fallback for browsers/environments where clipboard API is unavailable.
  if (typeof document === "undefined") return false;

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textArea);
  }
};
// ...existing code...

const EnrolleeTable: React.FC = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedSubscriptionId, setSelectedSubscriptionId] =
    useState<string>("");
  const [selectedCompanyPlanId, setSelectedCompanyPlanId] =
    useState<string>("");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [companyPlans, setCompanyPlans] = useState<CompanyPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [totalItems, setTotalItems] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(false);
  const [hasPreviousPage, setHasPreviousPage] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const enrollees = useEnrolleeStore((s) => s.enrollees);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notificationKey, setNotificationKey] = useState<number>(0);
  const [showCopyNotification, setShowCopyNotification] =
    useState<boolean>(false);
  const setEnrollees = useEnrolleeStore((s) => s.setEnrollees);
  const companies = useCompanyStore((s) => s.companies);
  const setCompanies = useCompanyStore((s) => s.setCompanies);
  const updateEnrolleeInStore = useEnrolleeStore((s) => s.updateEnrollee);
  const [selectedEnrollee, setSelectedEnrollee] = useState<Enrollee | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEnrolleeIds, setSelectedEnrolleeIds] = useState<string[]>([]);
  const [bulkNotificationMode, setBulkNotificationMode] = useState<
    "selected" | "company" | null
  >(null);
  const [sendingNotifications, setSendingNotifications] = useState(false);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState(
    "Failed to send enrollment notifications.",
  );
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  const notificationConfirmModal = useModal();
  const notificationSuccessModal = useModal();
  const notificationErrorModal = useModal();

  type Header = {
    key:
      | keyof Enrollee
      | "companyPlan"
      | "subscription"
      | "coverageExpiry"
      | "actions";
    label: string;
  };

  const select = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "30", label: "30" },
    { value: "40", label: "40" },
    { value: "50", label: "50" },
  ];

  const headers: Header[] = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "policyNumber", label: "Policy Number" },
    { key: "companyPlan", label: "Company Plan" },
    { key: "subscription", label: "Subscription" },
    { key: "coverageExpiry", label: "Expires" },
    { key: "isActive", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  const fetch = useCallback(async () => {
    try {
      setLoading(true);

      const data = await fetchEnrollees({
        limit,
        page: currentPage,
        q: search,
        companyId: selectedCompanyId || undefined,
        subscriptionId: selectedSubscriptionId || undefined,
        companyPlanId: selectedCompanyPlanId || undefined,
      });

      const items: Enrollee[] =
        data?.data?.enrollees && Array.isArray(data.data.enrollees)
          ? data.data.enrollees
          : Array.isArray(data)
            ? data
            : [];

      setEnrollees(items);
      setTotalItems(data?.data?.pagination?.total ?? 0);
      setHasNextPage(Boolean(data?.data?.pagination?.hasNextPage));
      setHasPreviousPage(Boolean(data?.data?.pagination?.hasPreviousPage));
      setTotalPages(data?.data?.pagination?.pages ?? 1);
    } catch (err) {
      console.warn("Enrollee fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [
    limit,
    currentPage,
    search,
    selectedCompanyId,
    selectedSubscriptionId,
    selectedCompanyPlanId,
    setEnrollees,
  ]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanyList = async () => {
      try {
        const data = await fetchCompanies({ limit: 100 });
        const items: Company[] =
          data?.data?.list && Array.isArray(data.data.list)
            ? data.data.list
            : [];
        setCompanies(items);
      } catch (err) {
        console.warn("Companies fetch failed", err);
      }
    };

    fetchCompanyList();
  }, [setCompanies]);

  useEffect(() => {
    const fetchCoverageFilters = async () => {
      try {
        const [subscriptionsResponse, companyPlansResponse] =
          await Promise.all([
            apiClient("/admin/subscriptions/list?limit=all", {
              method: "GET",
            }),
            fetchCompanyPlans({ limit: "all" }),
          ]);

        setSubscriptions(
          Array.isArray(subscriptionsResponse?.data?.list)
            ? subscriptionsResponse.data.list
            : [],
        );
        setCompanyPlans(
          Array.isArray(companyPlansResponse?.data?.list)
            ? companyPlansResponse.data.list
            : [],
        );
      } catch (err) {
        console.warn("Enrollee coverage filters fetch failed", err);
      }
    };

    fetchCoverageFilters();
  }, []);

  const availableSubscriptions = useMemo(
    () =>
      subscriptions.filter(
        (subscription) =>
          !selectedCompanyId || subscription.companyId === selectedCompanyId,
      ),
    [subscriptions, selectedCompanyId],
  );

  const availableCompanyPlans = useMemo(() => {
    const selectedSubscription = subscriptions.find(
      (subscription) => subscription.id === selectedSubscriptionId,
    );
    const subscriptionPlanIds = selectedSubscription
      ? new Set(
          (selectedSubscription.companyPlans || []).map((plan) => plan.id),
        )
      : null;

    return companyPlans.filter((plan) => {
      if (selectedCompanyId && plan.companyId !== selectedCompanyId) {
        return false;
      }

      return !subscriptionPlanIds || subscriptionPlanIds.has(plan.id);
    });
  }, [companyPlans, selectedCompanyId, selectedSubscriptionId, subscriptions]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId),
    [companies, selectedCompanyId],
  );
  const visibleEnrolleeIds = useMemo(
    () => enrollees.map((enrollee) => enrollee.id),
    [enrollees],
  );
  const selectedEnrolleeIdSet = useMemo(
    () => new Set(selectedEnrolleeIds),
    [selectedEnrolleeIds],
  );
  const selectedVisibleCount = visibleEnrolleeIds.filter((id) =>
    selectedEnrolleeIdSet.has(id),
  ).length;
  const allVisibleEnrolleesSelected =
    visibleEnrolleeIds.length > 0 &&
    selectedVisibleCount === visibleEnrolleeIds.length;

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedVisibleCount > 0 && !allVisibleEnrolleesSelected;
    }
  }, [allVisibleEnrolleesSelected, loading, selectedVisibleCount]);

  const startEntry: number =
    totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endEntry: number = Math.min(currentPage * limit, totalItems);

  const handleSelectChange = (selectedValue: string) => {
    setLimit(Number(selectedValue));
    setCurrentPage(1);
    setSelectedEnrolleeIds([]);
  };

  const handleCompanyChange = (selectedValue: string) => {
    setSelectedCompanyId(selectedValue === "all" ? "" : selectedValue);
    setSelectedSubscriptionId("");
    setSelectedCompanyPlanId("");
    setCurrentPage(1);
    setSelectedEnrolleeIds([]);
  };

  const handleSubscriptionChange = (selectedValue: string) => {
    const subscriptionId = selectedValue === "all" ? "" : selectedValue;
    setSelectedSubscriptionId(subscriptionId);

    if (selectedCompanyPlanId && subscriptionId) {
      const subscription = subscriptions.find(
        (item) => item.id === subscriptionId,
      );
      const includesSelectedPlan = subscription?.companyPlans?.some(
        (plan) => plan.id === selectedCompanyPlanId,
      );
      if (!includesSelectedPlan) setSelectedCompanyPlanId("");
    }

    setCurrentPage(1);
    setSelectedEnrolleeIds([]);
  };

  const handleCompanyPlanChange = (selectedValue: string) => {
    setSelectedCompanyPlanId(selectedValue === "all" ? "" : selectedValue);
    setCurrentPage(1);
    setSelectedEnrolleeIds([]);
  };

  const previousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const nextPage = () => {
    setCurrentPage((prev) => (hasNextPage ? prev + 1 : prev));
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const visiblePages: number[] = [];
  const maxVisiblePages = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  const end = Math.min(totalPages, start + maxVisiblePages - 1);

  if (end - start < maxVisiblePages - 1) {
    start = Math.max(1, end - maxVisiblePages + 1);
  }

  for (let i = start; i <= end; i++) {
    visiblePages.push(i);
  }

  const handlenavigate = (enrollee: Enrollee) => {
    router.push(`/enrollees/${enrollee.id}`);
  };

  const handleEdit = (enrollee: Enrollee) => {
    setSelectedEnrollee(enrollee);
    setIsEditOpen(true);
  };

  const toggleEnrolleeSelection = (enrolleeId: string) => {
    setSelectedEnrolleeIds((current) =>
      current.includes(enrolleeId)
        ? current.filter((id) => id !== enrolleeId)
        : [...current, enrolleeId],
    );
  };

  const toggleVisibleEnrolleeSelection = () => {
    setSelectedEnrolleeIds((current) => {
      if (allVisibleEnrolleesSelected) {
        return current.filter((id) => !visibleEnrolleeIds.includes(id));
      }

      return [...new Set([...current, ...visibleEnrolleeIds])];
    });
  };

  const handleBulkNotificationModal = (mode: "selected" | "company") => {
    if (mode === "selected" && selectedEnrolleeIds.length === 0) {
      setNotificationErrorMessage(
        "Select at least one enrollee before sending the notification.",
      );
      notificationErrorModal.openModal();
      return;
    }
    if (mode === "company" && !selectedCompanyId) {
      setNotificationErrorMessage(
        "Select a company before notifying all of its enrollees.",
      );
      notificationErrorModal.openModal();
      return;
    }

    setBulkNotificationMode(mode);
    notificationConfirmModal.openModal();
  };

  const closeNotificationConfirmModal = () => {
    setBulkNotificationMode(null);
    notificationConfirmModal.closeModal();
  };

  const sendBulkEnrollmentNotifications = async () => {
    if (!bulkNotificationMode) return;

    try {
      setSendingNotifications(true);
      const payload =
        bulkNotificationMode === "company"
          ? {
              companyId: selectedCompanyId,
              sendAllForCompany: true,
              confirmation: selectedCompanyId,
            }
          : {
              enrolleeIds: selectedEnrolleeIds,
              ...(selectedCompanyId ? { companyId: selectedCompanyId } : {}),
            };
      const response = await apiClient(
        "/admin/enrollees/bulk/resend-enrollment-notification",
        {
          method: "POST",
          body: payload,
        },
      );
      const result = response?.data || {};
      const sentCount = Number(result.sentCount || 0);
      const failedCount = Number(result.failedCount || 0);

      setSelectedEnrolleeIds([]);
      setBulkNotificationMode(null);
      notificationConfirmModal.closeModal();

      if (failedCount > 0) {
        const reasons = Array.isArray(result.failures)
          ? result.failures
              .slice(0, 3)
              .map((failure: { email?: string | null; reason?: string }) =>
                `${failure.email || "Enrollee"}: ${failure.reason || "Send failed"}`,
              )
              .join("; ")
          : "";
        setNotificationErrorMessage(
          `${sentCount} notification${sentCount === 1 ? " was" : "s were"} sent, but ${failedCount} failed.${reasons ? ` ${reasons}` : ""}`,
        );
        notificationErrorModal.openModal();
      } else {
        notificationSuccessModal.openModal();
      }

      await fetch();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setNotificationErrorMessage(
        err.message || "Failed to send enrollment notifications.",
      );
      notificationErrorModal.openModal();
    } finally {
      setSendingNotifications(false);
    }
  };

  const notificationConfirmation = useMemo(() => {
    if (bulkNotificationMode === "company") {
      return {
        title: `Notify all ${selectedCompany?.name || "company"} enrollees?`,
        message: `This will send the Complete HMO Enrollment message to every enrollee in ${
          selectedCompany?.name || "the selected company"
        }. Each enrollee will receive a new temporary password, replacing their current password.`,
        confirmLabel: "Notify company enrollees",
      };
    }

    const count = selectedEnrolleeIds.length;
    return {
      title: `Notify ${count} selected enrollee${count === 1 ? "" : "s"}?`,
      message: `This will send the Complete HMO Enrollment message and create a new temporary password for ${count} selected enrollee${
        count === 1 ? "" : "s"
      }. Their current passwords will be replaced.`,
      confirmLabel: `Notify ${count} enrollee${count === 1 ? "" : "s"}`,
    };
  }, [bulkNotificationMode, selectedCompany?.name, selectedEnrolleeIds.length]);

  return (
    <>
      {showCopyNotification && (
        <div className="fixed bottom-6 right-6 z-50">
          <Notification
            key={notificationKey}
            variant="success"
            title="Copied!"
            description="Policy number copied to clipboard."
            hideDuration={3000}
          />
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Enrollees Listing
            </h3>
          </div>

          <div className="flex w-full gap-3.5 xl:w-auto">
            <div className="flex w-full flex-wrap items-center gap-3 xl:justify-end">
              <Select
                options={[
                  { value: "all", label: "All Companies" },
                  ...companies.map((company) => ({
                    value: company.id,
                    label: company.name,
                  })),
                ]}
                placeholder="All Companies"
                onChange={handleCompanyChange}
                defaultValue={selectedCompanyId || "all"}
                className="min-w-[170px]"
              />
              <Select
                options={[
                  { value: "all", label: "All Subscriptions" },
                  ...availableSubscriptions.map((subscription) => ({
                    value: subscription.id,
                    label: subscription.code,
                  })),
                ]}
                placeholder="All Subscriptions"
                onChange={handleSubscriptionChange}
                defaultValue={selectedSubscriptionId || "all"}
                className="min-w-[180px]"
              />
              <Select
                options={[
                  { value: "all", label: "All Company Plans" },
                  ...availableCompanyPlans.map((plan) => ({
                    value: plan.id,
                    label: plan.name,
                  })),
                ]}
                placeholder="All Company Plans"
                onChange={handleCompanyPlanChange}
                defaultValue={selectedCompanyPlanId || "all"}
                className="min-w-[180px]"
              />
              <div className="relative min-w-[220px] flex-1 xl:flex-none">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <svg
                    className="fill-current"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                      fill=""
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search enrollees..."
                  className="dark:bg-dark-900 shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden xl:w-[260px] dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  value={search}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                    setSelectedEnrolleeIds([]);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-b border-blue-200 bg-blue-50 px-5 py-4 lg:flex-row lg:items-center lg:justify-between dark:border-blue-900/50 dark:bg-blue-500/10">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Complete HMO Enrollment notification
            </p>
            <p className="mt-1 text-sm leading-6 text-blue-800 dark:text-blue-400">
              Tick individual enrollees and notify the selection, or select a
              company above to notify every enrollee in that company. The
              configured notification template is used and each successful
              delivery appears in Notification Logs. Retriggering creates a new
              temporary password for every recipient.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => handleBulkNotificationModal("selected")}
              disabled={
                selectedEnrolleeIds.length === 0 || sendingNotifications
              }
              className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2.5 text-sm font-medium text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-brand-800 dark:bg-gray-900 dark:text-brand-400 dark:hover:bg-brand-500/10"
            >
              <MailIcon />
              Notify selected ({selectedEnrolleeIds.length})
            </button>
            <button
              type="button"
              onClick={() => handleBulkNotificationModal("company")}
              disabled={!selectedCompanyId || sendingNotifications}
              className="shadow-theme-xs inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <MailIcon />
              Notify company enrollees
            </button>
          </div>
        </div>
        {loading ? (
          <SpinnerThree />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                  <th className="w-12 p-4 text-left">
                    <input
                      ref={selectAllCheckboxRef}
                      type="checkbox"
                      checked={allVisibleEnrolleesSelected}
                      onChange={toggleVisibleEnrolleeSelection}
                      disabled={visibleEnrolleeIds.length === 0}
                      aria-label="Select all enrollees on this page"
                      className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                    />
                  </th>
                  {headers.map((h) => (
                    <th
                      key={h.key}
                      className="p-4 text-left text-xs font-medium text-gray-700 dark:text-gray-400"
                    >
                      <div className="flex items-center gap-3">
                        <p className="text-theme-xs font-medium text-gray-700 dark:text-gray-400">
                          {h.label}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-x divide-y divide-gray-200 dark:divide-gray-800">
                {enrollees.map((enrollee: Enrollee) => (
                  <tr
                    key={enrollee.id}
                    className={`transition hover:bg-gray-50 dark:hover:bg-gray-900 ${
                      selectedEnrolleeIdSet.has(enrollee.id)
                        ? "bg-brand-50/60 dark:bg-brand-500/5"
                        : ""
                    }`}
                  >
                    <td className="w-12 p-4">
                      <input
                        type="checkbox"
                        checked={selectedEnrolleeIdSet.has(enrollee.id)}
                        onChange={() => toggleEnrolleeSelection(enrollee.id)}
                        aria-label={`Select ${enrollee.firstName} ${enrollee.lastName}`}
                        className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900"
                      />
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                        {capitalizeWords(enrollee.firstName)}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                        {capitalizeWords(enrollee.lastName)}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {enrollee.email}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {enrollee.phoneNumber || "-"}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-400">
                          {enrollee.policyNumber}
                        </span>
                        {enrollee.policyNumber && (
                          <button
                            type="button"
                            title={
                              copiedId === enrollee.id
                                ? "Copied!"
                                : "Copy Policy Number"
                            }
                            className={`flex items-center justify-center rounded p-1 ml-1 transition-colors duration-150 text-gray-400 hover:text-gray-700 dark:hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500 ${copiedId === enrollee.id ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : ""}`}
                            style={{ lineHeight: 0 }}
                            onClick={async () => {
                              const copied = await copyTextToClipboard(
                                enrollee.policyNumber ?? "",
                              );

                              if (copied) {
                                setCopiedId(enrollee.id);
                                setShowCopyNotification(true);
                                setNotificationKey((k) => k + 1);
                                setTimeout(() => {
                                  setCopiedId(null);
                                  setShowCopyNotification(false);
                                }, 3000);
                              } else {
                                console.warn("Unable to copy policy number");
                              }
                            }}
                          >
                            <CopyIcon width={18} height={18} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {enrollee.companyPlan?.name || "-"}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {enrollee.Staff?.Subscription?.code || "-"}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        {enrollee.expirationDate ||
                        enrollee.Staff?.Subscription?.endDate
                          ? formatDate(
                              enrollee.expirationDate ||
                                enrollee.Staff?.Subscription?.endDate ||
                                "",
                            )
                          : "-"}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          enrollee.isActive
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {enrollee.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center w-full gap-2">
                        <button
                          onClick={() => handlenavigate(enrollee)}
                          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                          title="View enrollee"
                        >
                          <EyeIcon />
                        </button>
                        <button
                          onClick={() => handleEdit(enrollee)}
                          className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90"
                          title="Edit enrollee"
                        >
                          <PencilIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center flex-col sm:flex-row justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <Select
              options={select}
              placeholder="Select limit"
              onChange={handleSelectChange}
              defaultValue=""
            />
          </div>
          <div className="pb-4 sm:pb-0">
            <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">
              Showing{" "}
              <span className="text-gray-800 dark:text-white/90">
                {startEntry}
              </span>{" "}
              to{" "}
              <span className="text-gray-800 dark:text-white/90">
                {endEntry}
              </span>{" "}
              of{" "}
              <span className="text-gray-800 dark:text-white/90">
                {totalItems}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 bg-gray-50 p-4 sm:p-0 rounded-lg sm:bg-transparent dark:sm:bg-transparent w-full sm:w-auto dark:bg-white/[0.03] sm:justify-normal">
            <button
              className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={previousPage}
              disabled={!hasPreviousPage}
            >
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M2.58203 9.99868C2.58174 10.1909 2.6549 10.3833 2.80152 10.53L7.79818 15.5301C8.09097 15.8231 8.56584 15.8233 8.85883 15.5305C9.15183 15.2377 9.152 14.7629 8.85921 14.4699L5.13911 10.7472L16.6665 10.7472C17.0807 10.7472 17.4165 10.4114 17.4165 9.99715C17.4165 9.58294 17.0807 9.24715 16.6665 9.24715L5.14456 9.24715L8.85919 5.53016C9.15199 5.23717 9.15184 4.7623 8.85885 4.4695C8.56587 4.1767 8.09099 4.17685 7.79819 4.46984L2.84069 9.43049C2.68224 9.568 2.58203 9.77087 2.58203 9.99715C2.58203 9.99766 2.58203 9.99817 2.58203 9.99868Z"
                  fill=""
                />
              </svg>
            </button>
            <span className="block text-sm font-medium text-gray-700 sm:hidden dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <ul className="hidden items-center gap-0.5 sm:flex">
              {visiblePages.map((page) => (
                <li key={page}>
                  <button
                    onClick={() => goToPage(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium ${
                      page === currentPage
                        ? "bg-brand-500 text-white"
                        : "hover:bg-brand-500 text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                </li>
              ))}
              {visiblePages[visiblePages.length - 1] < totalPages && (
                <>
                  <li>
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 dark:text-gray-400">
                      ...
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={() => goToPage(totalPages)}
                      className="hover:bg-brand-500 flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-gray-700 hover:text-white dark:text-gray-400 dark:hover:text-white"
                    >
                      {totalPages}
                    </button>
                  </li>
                </>
              )}
            </ul>
            <button
              className={`shadow-theme-xs flex items-center gap-2 rounded-lg border border-gray-300 bg-white p-2 text-gray-700 hover:bg-gray-50 hover:text-gray-800 sm:p-2.5 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 ${
                currentPage === totalPages
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.4165 9.9986C17.4168 10.1909 17.3437 10.3832 17.197 10.53L12.2004 15.5301C11.9076 15.8231 11.4327 15.8233 11.1397 15.5305C10.8467 15.2377 10.8465 14.7629 11.1393 14.4699L14.8594 10.7472L3.33203 10.7472C2.91782 10.7472 2.58203 10.4114 2.58203 9.99715C2.58203 9.58294 2.91782 9.24715 3.33203 9.24715L14.854 9.24715L11.1393 5.53016C10.8465 5.23717 10.8467 4.7623 11.1397 4.4695C11.4327 4.1767 11.9075 4.17685 12.2003 4.46984L17.1578 9.43049C17.3163 9.568 17.4165 9.77087 17.4165 9.99715C17.4165 9.99763 17.4165 9.99812 17.4165 9.9986Z"
                  fill=""
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ConfirmModal
        confirmModal={notificationConfirmModal}
        handleSave={() => void sendBulkEnrollmentNotifications()}
        closeModal={closeNotificationConfirmModal}
        title={notificationConfirmation.title}
        message={notificationConfirmation.message}
        confirmLabel={notificationConfirmation.confirmLabel}
        cancelLabel="Cancel"
        loading={sendingNotifications}
      />
      <SuccessModal
        successModal={notificationSuccessModal}
        handleSuccessClose={notificationSuccessModal.closeModal}
      />
      <ErrorModal
        message={notificationErrorMessage}
        errorModal={notificationErrorModal}
        handleErrorClose={notificationErrorModal.closeModal}
      />
      <EditEnrolleeModal
        enrollee={selectedEnrollee}
        isOpen={isEditOpen}
        closeModal={() => setIsEditOpen(false)}
        onSuccess={(updated) => updateEnrolleeInStore(updated.id, updated)}
      />
    </>
  );
};

export default EnrolleeTable;
