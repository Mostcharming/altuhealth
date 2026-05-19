"use client";

import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useAuthorizationCodeStore } from "@/lib/store/authorizationCodeStore";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type EnrolleeLookupStatus =
  | "idle"
  | "searching"
  | "found"
  | "not-found"
  | "error";

interface Diagnosis {
  id: string;
  name: string;
  code: string;
}
interface ClaimDetail {
  enrolleeId?: string;
  retailEnrolleeId?: string;
  companyId?: string;
  serviceDate: string;
  dischargeDate?: string;
  serviceType:
    | "outpatient"
    | "inpatient"
    | "emergency"
    | "procedure"
    | "consultation"
    | "diagnostic"
    | "laboratory"
    | "pharmacy"
    | "dental"
    | "optical";
  description?: string;
  amountSubmitted: number;
  quantity?: number;
  unitPrice?: number;
  procedureCode?: string;
  procedureName?: string;
  authorizationCode?: string;
  diagnosisId?: string;
  items?: ClaimDetailItem[];
}

interface ClaimDetailItem {
  itemType: "drug" | "service";
  itemId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  unit?: string;
  description?: string;
}

const serviceTypeOptions = [
  { value: "outpatient", label: "Outpatient" },
  { value: "inpatient", label: "Inpatient" },
  { value: "emergency", label: "Emergency" },
  { value: "procedure", label: "Procedure" },
  { value: "consultation", label: "Consultation" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "laboratory", label: "Laboratory" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "dental", label: "Dental" },
  { value: "optical", label: "Optical" },
];

const itemTypeOptions = [
  { value: "drug", label: "Drug" },
  { value: "service", label: "Service" },
];

export default function PageMetricsAuthorizationCodes({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const addAuthorizationCode = useAuthorizationCodeStore(
    (state) => state.addAuthorizationCode,
  );

  const errorModal = useModal();
  const successModal = useModal();

  // Form state
  const [enrolleeId, setEnrolleeId] = useState("");
  const [enrolleeLookupValue, setEnrolleeLookupValue] = useState("");
  const [enrolleeLookupStatus, setEnrolleeLookupStatus] =
    useState<EnrolleeLookupStatus>("idle");
  const [enrolleeLookupHint, setEnrolleeLookupHint] = useState(
    "Type policy number or email.",
  );
  const [providerId, setProviderId] = useState("");
  const [diagnosisId, setDiagnosisId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyPlanId, setCompanyPlanId] = useState("");
  const [authorizationType, setAuthorizationType] = useState<
    "inpatient" | "outpatient" | "procedure" | "medication" | "diagnostic"
  >("inpatient");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [amountAuthorized, setAmountAuthorized] = useState("");
  const [reasonForCode, setReasonForCode] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch data
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const enrolleeLookupRequestIdRef = useRef(0);

  const [claimDetails, setClaimDetails] = useState<ClaimDetail[]>([]);
  const [currentDetailIndex, setCurrentDetailIndex] = useState<number | null>(
    null,
  );
  const [currentDetail, setCurrentDetail] = useState<ClaimDetail>({
    enrolleeId: "",
    serviceDate: "",
    serviceType: "outpatient",
    amountSubmitted: 0,
    items: [],
  });
  const [currentItem, setCurrentItem] = useState<ClaimDetailItem>({
    itemType: "drug",
    itemId: "",
    itemName: "",
    quantity: 1,
    unitPrice: 0,
  });

  const [errorMessage, setErrorMessage] = useState(
    "Failed to create authorization code. Please try again.",
  );

  const authorizationTypeOptions = [
    { value: "inpatient", label: "Inpatient" },
    { value: "outpatient", label: "Outpatient" },
    { value: "procedure", label: "Procedure" },
    { value: "medication", label: "Medication" },
    { value: "diagnostic", label: "Diagnostic" },
  ];

  useEffect(() => {
    if (isOpen) {
      fetchDiagnoses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const searchValue = enrolleeLookupValue.trim();
    if (!searchValue) {
      setEnrolleeId("");
      setEnrolleeLookupStatus("idle");
      setEnrolleeLookupHint("Type policy number or email.");
      return;
    }

    if (searchValue.length < 3) {
      setEnrolleeId("");
      setEnrolleeLookupStatus("idle");
      setEnrolleeLookupHint("Keep typing at least 3 characters.");
      return;
    }

    const requestId = ++enrolleeLookupRequestIdRef.current;
    setEnrolleeLookupStatus("searching");
    setEnrolleeLookupHint("Checking enrollee...");

    const timer = setTimeout(async () => {
      try {
        const data = await apiClient(
          `/provider/enrollee-lookup?query=${encodeURIComponent(searchValue)}`,
          {
            method: "GET",
          },
        );

        if (requestId !== enrolleeLookupRequestIdRef.current) return;

        const enrollee = data?.data?.enrollee;
        if (enrollee?.id) {
          setEnrolleeId(String(enrollee.id));
          setEnrolleeLookupStatus("found");
          setEnrolleeLookupHint(
            `Found: ${enrollee.firstName} ${enrollee.lastName} (${enrollee.policyNumber || enrollee.email})`,
          );
          return;
        }

        setEnrolleeId("");
        setEnrolleeLookupStatus("not-found");
        setEnrolleeLookupHint(
          "No enrollee found for this policy number/email.",
        );
      } catch (err) {
        if (requestId !== enrolleeLookupRequestIdRef.current) return;

        const message =
          err instanceof Error ? err.message : "Failed to validate enrollee.";

        setEnrolleeId("");

        if (/not found/i.test(message)) {
          setEnrolleeLookupStatus("not-found");
          setEnrolleeLookupHint(
            "No enrollee found for this policy number/email.",
          );
        } else {
          setEnrolleeLookupStatus("error");
          setEnrolleeLookupHint("Unable to validate enrollee right now.");
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [enrolleeLookupValue, isOpen]);

  const fetchDiagnoses = async () => {
    try {
      const data = await apiClient("/admin/diagnosis/list?limit=all", {
        method: "GET",
      });
      const items: Diagnosis[] =
        data?.data?.list && Array.isArray(data.data.list)
          ? data.data.list
          : Array.isArray(data)
            ? data
            : [];
      setDiagnoses(items);
    } catch (err) {
      console.warn("Failed to fetch diagnoses", err);
    }
  };

  const totalItemsAmount =
    currentDetail.items?.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    ) || 0;

  const resetForm = () => {
    setEnrolleeId("");
    setEnrolleeLookupValue("");
    setEnrolleeLookupStatus("idle");
    setEnrolleeLookupHint("Type policy number or email.");
    setProviderId("");
    setDiagnosisId("");
    setCompanyId("");
    setCompanyPlanId("");
    setAuthorizationType("inpatient");
    setValidFrom("");
    setValidTo("");
    setAmountAuthorized("");
    setReasonForCode("");
    setApprovalNote("");
    setNotes("");
    enrolleeLookupRequestIdRef.current += 1;
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };
  const handleRemoveItem = (index: number) => {
    const items = currentDetail.items?.filter((_, i) => i !== index) || [];
    setCurrentDetail({ ...currentDetail, items });
  };

  const calculateDetailAmount = (detail: ClaimDetail): number => {
    if (detail.items && detail.items.length > 0) {
      return detail.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
    }
    return detail.amountSubmitted || 0;
  };

  const handleAddDetail = () => {
    if (!currentDetail.enrolleeId || !currentDetail.serviceDate) {
      setErrorMessage("Enrollee and Service Date are required");
      errorModal.openModal();
      return;
    }

    const detailAmount = calculateDetailAmount(currentDetail);
    if (detailAmount <= 0) {
      setErrorMessage("Detail amount must be greater than 0");
      errorModal.openModal();
      return;
    }

    if (currentDetailIndex !== null) {
      const details = [...claimDetails];
      details[currentDetailIndex] = {
        ...currentDetail,
        amountSubmitted: detailAmount,
      };
      setClaimDetails(details);
    } else {
      setClaimDetails([
        ...claimDetails,
        { ...currentDetail, amountSubmitted: detailAmount },
      ]);
    }

    setCurrentDetail({
      enrolleeId: "",
      serviceDate: "",
      serviceType: "outpatient",
      amountSubmitted: 0,
      items: [],
    });
    setCurrentDetailIndex(null);
  };

  const handleEditDetail = (index: number) => {
    setCurrentDetail(claimDetails[index]);
    setCurrentDetailIndex(index);
  };

  const handleRemoveDetail = (index: number) => {
    setClaimDetails(claimDetails.filter((_, i) => i !== index));
    if (currentDetailIndex === index) {
      setCurrentDetailIndex(null);
      setCurrentDetail({
        enrolleeId: "",
        serviceDate: "",
        serviceType: "outpatient",
        amountSubmitted: 0,
        items: [],
      });
    }
  };

  const calculateTotalAmount = (): number => {
    return claimDetails.reduce(
      (sum, detail) => sum + (detail.amountSubmitted || 0),
      0,
    );
  };

  const handleSubmit = async () => {
    try {
      if (!enrolleeId) {
        setErrorMessage("`enrolleeId` is required");
        errorModal.openModal();
        return;
      }
      if (enrolleeLookupStatus !== "found") {
        setErrorMessage(
          "Please enter a valid enrollee policy number or email.",
        );
        errorModal.openModal();
        return;
      }
      if (!companyId) {
        setErrorMessage("`companyId` is required");
        errorModal.openModal();
        return;
      }
      if (!authorizationType) {
        setErrorMessage("`authorizationType` is required");
        errorModal.openModal();
        return;
      }
      if (!validFrom) {
        setErrorMessage("`validFrom` is required");
        errorModal.openModal();
        return;
      }
      if (!validTo) {
        setErrorMessage("`validTo` is required");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        enrolleeId,
        providerId: providerId || undefined,
        diagnosisId: diagnosisId || undefined,
        companyId,
        companyPlanId: companyPlanId || undefined,
        authorizationType,
        validFrom,
        validTo,
        amountAuthorized: amountAuthorized
          ? Number(amountAuthorized)
          : undefined,
        reasonForCode: reasonForCode || undefined,
        approvalNote: approvalNote || undefined,
        notes: notes || undefined,
      };

      const data = await apiClient("/admin/authorization-codes", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.authorizationCode) {
        addAuthorizationCode(data.data.authorizationCode);
        successModal.openModal();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred.",
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };
  const handleAddItem = () => {
    if (!currentItem.itemId || !currentItem.itemName) {
      setErrorMessage("Item ID and Item Name are required");
      errorModal.openModal();
      return;
    }

    const items = currentDetail.items || [];
    items.push({ ...currentItem });
    setCurrentDetail({ ...currentDetail, items });
    setCurrentItem({
      itemType: "drug",
      itemId: "",
      itemName: "",
      quantity: 1,
      unitPrice: 0,
    });
  };
  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className=" flex items-center justify-between">
        <div></div>
        <div>
          <div
            onClick={openModal}
            className="cursor-pointer bg-brand-500 shadow-theme-xs hover:bg-brand-600 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                d="M5 10.0002H15.0006M10.0002 5V15.0006"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {buttonText}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Create Authorization Code
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details to create a new authorization code.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Enrollee *
                </label>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <Input
                      type="text"
                      placeholder="Type policy number or email..."
                      value={enrolleeLookupValue}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEnrolleeLookupValue(e.target.value)
                      }
                      success={enrolleeLookupStatus === "found"}
                      error={
                        enrolleeLookupStatus === "not-found" ||
                        enrolleeLookupStatus === "error"
                      }
                      hint={enrolleeLookupHint}
                    />
                  </div>

                  <div className="h-11 w-11 flex items-center justify-center rounded-lg border border-gray-300 dark:border-gray-700 mt-[1px]">
                    {enrolleeLookupStatus === "searching" ? (
                      <svg
                        className="h-5 w-5 animate-spin text-gray-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          opacity="0.25"
                        />
                        <path
                          d="M22 12a10 10 0 0 0-10-10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : enrolleeLookupStatus === "found" ? (
                      <svg
                        className="h-6 w-6 text-green-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : enrolleeLookupStatus === "not-found" ||
                      enrolleeLookupStatus === "error" ? (
                      <svg
                        className="h-6 w-6 text-red-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 6L6 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle
                          cx="11"
                          cy="11"
                          r="7"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M20 20L17 17"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Diagnosis
                </label>
                <Select
                  options={diagnoses.map((d) => ({
                    value: d.id,
                    label: `${d.name} `,
                  }))}
                  placeholder="Select diagnosis"
                  onChange={(value) => setDiagnosisId(value as string)}
                  defaultValue={diagnosisId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Authorization Type *
                </label>
                <Select
                  options={authorizationTypeOptions}
                  placeholder="Select type"
                  onChange={(value) =>
                    setAuthorizationType(
                      value as
                        | "inpatient"
                        | "outpatient"
                        | "procedure"
                        | "medication"
                        | "diagnostic",
                    )
                  }
                  defaultValue={authorizationType}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountAuthorized}
                  onChange={(e) => setAmountAuthorized(e.target.value)}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter notes..."
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  rows={3}
                />
              </div>
            </div>

            <div className="mb-8">
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Service Encounters
              </h5>

              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 mb-4">
                  <div>
                    <DatePicker
                      id="serviceDate"
                      label="Service Date *"
                      placeholder="Select date"
                      defaultDate={currentDetail.serviceDate}
                      onChange={(selectedDates) => {
                        if (selectedDates[0]) {
                          const date = new Date(selectedDates[0]);
                          setCurrentDetail({
                            ...currentDetail,
                            serviceDate: date.toISOString().split("T")[0],
                          });
                        }
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Service Type *
                    </label>
                    <Select
                      options={serviceTypeOptions}
                      placeholder="Select type"
                      onChange={(value) =>
                        setCurrentDetail({
                          ...currentDetail,
                          serviceType: value as
                            | "outpatient"
                            | "inpatient"
                            | "emergency"
                            | "procedure"
                            | "consultation"
                            | "diagnostic"
                            | "laboratory"
                            | "pharmacy"
                            | "dental"
                            | "optical",
                        })
                      }
                      defaultValue={currentDetail.serviceType}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={currentDetail.description || ""}
                    onChange={(e) =>
                      setCurrentDetail({
                        ...currentDetail,
                        description: e.target.value,
                      })
                    }
                    placeholder="Enter service description..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    rows={2}
                  />
                </div>

                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Service Items
                  </h6>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Item Type
                      </label>
                      <Select
                        options={itemTypeOptions}
                        placeholder="Select type"
                        onChange={(value) =>
                          setCurrentItem({
                            ...currentItem,
                            itemType: value as "drug" | "service",
                          })
                        }
                        defaultValue={currentItem.itemType}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Item ID *
                      </label>
                      <input
                        type="text"
                        placeholder="Item ID"
                        value={currentItem.itemId}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            itemId: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Item Name *
                      </label>
                      <input
                        type="text"
                        placeholder="Item name"
                        value={currentItem.itemName}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            itemName: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., tablet, bottle"
                        value={currentItem.unit || ""}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            unit: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={currentItem.quantity}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            quantity: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>

                    {/* Unit Price */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Unit Price *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={currentItem.unitPrice}
                        onChange={(e) =>
                          setCurrentItem({
                            ...currentItem,
                            unitPrice: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  {currentDetail.items && currentDetail.items.length > 0 && (
                    <div className="mb-3">
                      <div className="bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        {currentDetail.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                          >
                            <div className="text-xs">
                              <p className="font-medium text-gray-800 dark:text-white">
                                {item.itemName}
                              </p>
                              <p className="text-gray-500 dark:text-gray-400">
                                {item.quantity} × {item.unitPrice} ={" "}
                                {(item.quantity * item.unitPrice).toFixed(2)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-2">
                        Total: ₦{totalItemsAmount.toFixed(2)}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full text-sm bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-white py-2 rounded transition"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Add/Update Detail Button */}
                <button
                  type="button"
                  onClick={handleAddDetail}
                  className="w-full text-sm bg-brand-500 hover:bg-brand-600 text-white py-2 rounded transition font-medium"
                >
                  {currentDetailIndex !== null ? "Update Detail" : "Add Detail"}
                </button>
              </div>

              {/* Details List */}
              {claimDetails.length > 0 && (
                <div className="space-y-2">
                  {claimDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-between"
                    >
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-gray-800 dark:text-white">
                          Detail {idx + 1} - ₦
                          {detail.amountSubmitted?.toFixed(2) || "0.00"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          {detail.serviceType} • {detail.serviceDate}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditDetail(idx)}
                          className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveDetail(idx)}
                          className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-900/10 border border-brand-200 dark:border-brand-900/30 rounded">
                    <p className="text-sm font-semibold text-brand-900 dark:text-brand-400">
                      Total Claim Amount: ₦{calculateTotalAmount().toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6 px-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              onClick={handleSubmit}
              type="button"
              className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
            >
              Create Authorization Code
            </button>
          </div>
        </form>
      </Modal>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </div>
  );
}
