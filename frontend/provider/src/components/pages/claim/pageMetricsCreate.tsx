/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { useClaimStore } from "@/lib/store/claimStore";
import { useEffect, useState } from "react";

interface Enrollee {
  id: string;
  firstName: string;
  lastName: string;
  policyNumber: string;
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

export default function PageMetricsClaimsCreate() {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const addClaim = useClaimStore((state) => state.addClaim);

  const errorModal = useModal();
  const successModal = useModal();

  // Main claim form state
  const [numberOfEncounters, setNumberOfEncounters] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [bankUsedForPayment, setBankUsedForPayment] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [description, setDescription] = useState("");

  // Claim details
  const [claimDetails, setClaimDetails] = useState<ClaimDetail[]>([]);
  const [currentDetailIndex, setCurrentDetailIndex] = useState<number | null>(
    null
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

  // Fetch data
  const [enrollees, setEnrollees] = useState<Enrollee[]>([]);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create claim. Please try again."
  );

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(2024, i).toLocaleString("default", { month: "long" }),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: (new Date().getFullYear() - i).toString(),
    label: (new Date().getFullYear() - i).toString(),
  }));

  useEffect(() => {
    if (isOpen) {
      fetchEnrollees();
    }
  }, [isOpen]);

  const fetchEnrollees = async () => {
    try {
      const data = await apiClient("/admin/enrollees?limit=all", {
        method: "GET",
      });
      const items: Enrollee[] =
        data?.data?.enrollees && Array.isArray(data.data.enrollees)
          ? data.data.enrollees
          : Array.isArray(data)
          ? data
          : [];
      setEnrollees(items);
    } catch (err) {
      console.warn("Failed to fetch enrollees", err);
    }
  };

  const resetForm = () => {
    setNumberOfEncounters("");
    setYear(new Date().getFullYear().toString());
    setMonth((new Date().getMonth() + 1).toString());
    setBankUsedForPayment("");
    setBankAccountNumber("");
    setAccountName("");
    setDescription("");
    setClaimDetails([]);
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
    setCurrentDetailIndex(null);
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

  const handleRemoveItem = (index: number) => {
    const items = currentDetail.items?.filter((_, i) => i !== index) || [];
    setCurrentDetail({ ...currentDetail, items });
  };

  const calculateDetailAmount = (detail: ClaimDetail): number => {
    if (detail.items && detail.items.length > 0) {
      return detail.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
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
      0
    );
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const handleSubmit = async () => {
    try {
      // Validation
      if (!numberOfEncounters) {
        setErrorMessage("`numberOfEncounters` is required");
        errorModal.openModal();
        return;
      }
      if (!year) {
        setErrorMessage("`year` is required");
        errorModal.openModal();
        return;
      }
      if (!month) {
        setErrorMessage("`month` is required");
        errorModal.openModal();
        return;
      }
      if (claimDetails.length === 0) {
        setErrorMessage("At least one claim detail is required");
        errorModal.openModal();
        return;
      }

      const totalAmount = calculateTotalAmount();
      if (totalAmount <= 0) {
        setErrorMessage("Total claim amount must be greater than 0");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      // Get provider ID from localStorage or context
      const providerId = localStorage.getItem("providerId");
      if (!providerId) {
        setErrorMessage("Provider ID not found. Please login again.");
        errorModal.openModal();
        return;
      }

      const payload = {
        providerId,
        numberOfEncounters: parseInt(numberOfEncounters),
        amountSubmitted: totalAmount,
        year: parseInt(year),
        month: parseInt(month),
        bankUsedForPayment: bankUsedForPayment || undefined,
        bankAccountNumber: bankAccountNumber || undefined,
        accountName: accountName || undefined,
        description: description || undefined,
        claimDetails,
      };

      const data = await apiClient("/admin/claims/with-details", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data?.claim) {
        addClaim(data.data.claim);
        successModal.openModal();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const totalItemsAmount =
    currentDetail.items?.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    ) || 0;

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
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
            Create Claim
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-4xl p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Create Claim
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the claim details and add service encounters below.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar max-h-[600px] overflow-y-auto px-2">
            {/* Main Claim Info */}
            <div className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Claim Information
              </h5>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                {/* Number of Encounters */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Number of Encounters *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5"
                    value={numberOfEncounters}
                    onChange={(e) => setNumberOfEncounters(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Year *
                  </label>
                  <Select
                    options={yearOptions}
                    placeholder="Select year"
                    onChange={(value) => setYear(value as string)}
                    defaultValue={year}
                  />
                </div>

                {/* Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Month *
                  </label>
                  <Select
                    options={monthOptions}
                    placeholder="Select month"
                    onChange={(value) => setMonth(value as string)}
                    defaultValue={month}
                  />
                </div>

                {/* Bank Used for Payment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Bank Used for Payment
                  </label>
                  <input
                    type="text"
                    placeholder="Bank name"
                    value={bankUsedForPayment}
                    onChange={(e) => setBankUsedForPayment(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                {/* Bank Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    placeholder="0000000000"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="Account holder name"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                {/* Description */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter claim description..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Claim Details Section */}
            <div className="mb-8">
              <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Service Encounters
              </h5>

              {/* Add/Edit Detail Form */}
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 mb-4">
                  {/* Enrollee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-2">
                      Enrollee *
                    </label>
                    <Select
                      options={enrollees.map((e) => ({
                        value: e.id,
                        label: `${e.firstName} ${e.lastName} (${e.policyNumber})`,
                      }))}
                      placeholder="Select enrollee"
                      onChange={(value) =>
                        setCurrentDetail({
                          ...currentDetail,
                          enrolleeId: value as string,
                        })
                      }
                      defaultValue={currentDetail.enrolleeId || ""}
                    />
                  </div>

                  {/* Service Date */}
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

                  {/* Service Type */}
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
                          serviceType: value as any,
                        })
                      }
                      defaultValue={currentDetail.serviceType}
                    />
                  </div>

                  {/* Discharge Date */}
                  <div>
                    <DatePicker
                      id="dischargeDate"
                      label="Discharge Date"
                      placeholder="Select date"
                      defaultDate={currentDetail.dischargeDate}
                      onChange={(selectedDates) => {
                        if (selectedDates[0]) {
                          const date = new Date(selectedDates[0]);
                          setCurrentDetail({
                            ...currentDetail,
                            dischargeDate: date.toISOString().split("T")[0],
                          });
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Detail Description */}
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

                {/* Items Section */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h6 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Service Items
                  </h6>

                  <div className="grid grid-cols-1 gap-x-6 gap-y-3 lg:grid-cols-2 mb-3">
                    {/* Item Type */}
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
                            itemType: value as any,
                          })
                        }
                        defaultValue={currentItem.itemType}
                      />
                    </div>

                    {/* Item ID */}
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

                    {/* Item Name */}
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

                    {/* Unit */}
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

                    {/* Quantity */}
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

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end mt-6 px-2 border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              Cancel
            </button>
            <button
              disabled={loading || claimDetails.length === 0}
              onClick={handleSubmit}
              type="button"
              className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Claim"}
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
