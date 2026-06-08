"use client";

import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { fetchProviderDrugs, fetchProviderServices } from "@/lib/apis/tariff";
import { useAuthorizationCodeStore } from "@/lib/store/authorizationCodeStore";
import { Drug } from "@/lib/store/drugStore";
import { Service } from "@/lib/store/serviceStore";
import { TrashBinIcon } from "@/icons";
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
  serviceDate: string;
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

type MemberType =
  | "enrollee"
  | "dependent"
  | "retail_enrollee"
  | "retail_dependent";

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
  const [memberType, setMemberType] = useState<MemberType>("enrollee");
  const [enrolleeLookupValue, setEnrolleeLookupValue] = useState("");
  const [enrolleeLookupStatus, setEnrolleeLookupStatus] =
    useState<EnrolleeLookupStatus>("idle");
  const [enrolleeLookupHint, setEnrolleeLookupHint] = useState(
    "Type policy number or email.",
  );
  const [diagnosisId, setDiagnosisId] = useState("");
  const [authorizationType, setAuthorizationType] = useState<
    "inpatient" | "outpatient" | "procedure" | "medication" | "diagnostic"
  >("inpatient");
  const [notes, setNotes] = useState("");

  // Fetch data
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const enrolleeLookupRequestIdRef = useRef(0);

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
      fetchTariffItems();
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
          `/provider/search/enrollee-lookup?query=${encodeURIComponent(searchValue)}`,
          {
            method: "GET",
          },
        );

        if (requestId !== enrolleeLookupRequestIdRef.current) return;

        const member = data?.data?.enrollee || data?.data?.dependent;
        if (member?.id) {
          const resultType = (data?.data?.resultType ||
            "enrollee") as MemberType;
          setEnrolleeId(String(member.id));
          setMemberType(resultType);
          setEnrolleeLookupStatus("found");
          setEnrolleeLookupHint(
            `Found: ${member.firstName} ${member.lastName} (${member.policyNumber || member.email})`,
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

  const fetchTariffItems = async () => {
    try {
      const [drugsData, servicesData] = await Promise.all([
        fetchProviderDrugs({ limit: 1000, status: "active" }),
        fetchProviderServices({ limit: 1000, status: "active" }),
      ]);

      const drugItems: Drug[] =
        drugsData?.data?.list && Array.isArray(drugsData.data.list)
          ? drugsData.data.list
          : [];
      const serviceItems: Service[] =
        servicesData?.data?.list && Array.isArray(servicesData.data.list)
          ? servicesData.data.list
          : [];

      setDrugs(drugItems);
      setServices(serviceItems);
    } catch (err) {
      console.warn("Failed to fetch provider tariffs", err);
    }
  };

  const resetForm = () => {
    setEnrolleeId("");
    setMemberType("enrollee");
    setEnrolleeLookupValue("");
    setEnrolleeLookupStatus("idle");
    setEnrolleeLookupHint("Type policy number or email.");
    setDiagnosisId("");
    setAuthorizationType("inpatient");
    setNotes("");
    setCurrentDetail({
      enrolleeId: "",
      serviceDate: "",
      serviceType: "outpatient",
      amountSubmitted: 0,
      items: [],
    });
    setCurrentItem({
      itemType: "drug",
      itemId: "",
      itemName: "",
      quantity: 1,
      unitPrice: 0,
    });
    enrolleeLookupRequestIdRef.current += 1;
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
    window.location.reload();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };
  const handleRemoveItem = (index: number) => {
    const items = currentDetail.items?.filter((_, i) => i !== index) || [];
    setCurrentDetail({ ...currentDetail, items });
  };

  const getServicePrice = (service: Service) =>
    Number(service.price || service.fixedPrice || service.rateAmount || 0);

  const selectTariffItem = (itemId: string) => {
    if (currentItem.itemType === "drug") {
      const drug = drugs.find((item) => item.id === itemId);
      setCurrentItem({
        ...currentItem,
        itemId,
        itemName: drug?.name || "",
        unit: drug?.unit || "",
        unitPrice: Number(drug?.price || 0),
      });
      return;
    }

    const service = services.find((item) => item.id === itemId);
    setCurrentItem({
      ...currentItem,
      itemId,
      itemName: service?.name || "",
      unit: service?.rateType || service?.priceType || "service",
      unitPrice: service ? getServicePrice(service) : 0,
    });
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
      if (!authorizationType) {
        setErrorMessage("`authorizationType` is required");
        errorModal.openModal();
        return;
      }
      if (!currentDetail.serviceDate) {
        setErrorMessage("Authorization date is required");
        errorModal.openModal();
        return;
      }
      if (!currentDetail.items?.length) {
        setErrorMessage("Add at least one service encounter item");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        memberId: enrolleeId,
        resultType: memberType,
        diagnosisId: diagnosisId || undefined,
        authorizationType,
        date: currentDetail.serviceDate,
        notes: notes || undefined,
        items: currentDetail.items.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          quantity: item.quantity,
          notes: item.description || undefined,
        })),
      };

      const data = await apiClient("/provider/authorization-codes", {
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
      setErrorMessage("Select a drug or service");
      errorModal.openModal();
      return;
    }

    setCurrentDetail({
      ...currentDetail,
      items: [...(currentDetail.items || []), { ...currentItem }],
    });
    setCurrentItem({
      itemType: currentItem.itemType,
      itemId: "",
      itemName: "",
      quantity: 1,
      unitPrice: 0,
      unit: "",
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
        className="max-w-[960px] p-0 m-4"
      >
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                Create Authorization Code
              </h4>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Select the member, request details, and provider-rendered items.
              </p>
            </div>
          </div>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[420px] sm:h-[560px] overflow-y-auto px-5 py-5 lg:px-6">
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

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
                  Service Encounter
                </h5>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  {currentDetail.items?.length || 0} item
                  {(currentDetail.items?.length || 0) === 1 ? "" : "s"}
                </span>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/30">
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

                <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/60">
                  <h6 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                            itemType: value as "drug" | "service",
                            itemId: "",
                            itemName: "",
                            quantity: 1,
                            unitPrice: 0,
                            unit: "",
                          })
                        }
                        defaultValue={currentItem.itemType}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        {currentItem.itemType === "drug" ? "Drug" : "Service"} *
                      </label>
                      <Select
                        options={
                          currentItem.itemType === "drug"
                            ? drugs.map((drug) => ({
                                value: drug.id,
                                label: `${drug.name} - ${drug.unit}`,
                              }))
                            : services.map((service) => ({
                                value: service.id,
                                label: `${service.name} - ${service.code}`,
                              }))
                        }
                        placeholder={`Select ${currentItem.itemType}`}
                        onChange={(value) => selectTariffItem(value as string)}
                        defaultValue={currentItem.itemId}
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
                        onChange={() => undefined}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        placeholder="Unit"
                        value={currentItem.unit || ""}
                        onChange={() => undefined}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
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
                        onChange={() => undefined}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-500 mb-1">
                        Line Amount
                      </label>
                      <input
                        type="number"
                        value={(
                          currentItem.quantity * currentItem.unitPrice
                        ).toFixed(2)}
                        onChange={() => undefined}
                        disabled
                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  {currentDetail.items && currentDetail.items.length > 0 && (
                    <div className="mb-3">
                      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
                        {currentDetail.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="grid grid-cols-[1fr_auto] gap-3 border-b border-gray-200 p-3 last:border-b-0 dark:border-gray-700"
                          >
                            <div className="min-w-0 text-xs">
                              <p className="font-medium text-gray-800 dark:text-white">
                                {item.itemName}
                              </p>
                              <p className="mt-1 text-gray-500 dark:text-gray-400">
                                {item.itemType} • {item.quantity} × ₦
                                {Number(item.unitPrice).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
                                ₦{(item.quantity * item.unitPrice).toFixed(2)}
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                aria-label={`Remove ${item.itemName}`}
                                title="Remove item"
                                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                              >
                                <TrashBinIcon />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-gray-200 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-700"
                  >
                    + Add Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end border-t border-gray-200 px-5 py-4 dark:border-gray-700 lg:px-6">
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
