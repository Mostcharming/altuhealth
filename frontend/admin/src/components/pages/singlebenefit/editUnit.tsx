/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { Benefit, useBenefitStore } from "@/lib/store/benefitStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditUnitProps {
  isOpen: boolean;
  closeModal: () => void;
  unit?: Benefit | null;
}

export default function EditUnit({ isOpen, closeModal, unit }: EditUnitProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [isCovered, setIsCovered] = useState(false);
  const [coverageType, setCoverageType] = useState("");
  const [coverageValue, setCoverageValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>(
    "Failed to update unit."
  );

  const updateUser = useBenefitStore((s) => s.updateBenefit);

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  // When the modal opens with a role, populate the form with its data.
  useEffect(() => {
    if (isOpen && unit) {
      setId(unit.id ?? "");
      setName(unit.name ?? "");
      setAmount(unit.amount ?? 0);
      setLimit(unit.limit ?? "");
      setDescription(unit.description ?? "");
      setIsCovered((unit as any).isCovered ?? false);
      setCoverageType((unit as any).coverageType ?? "");
      setCoverageValue((unit as any).coverageValue ?? "");
    }

    if (!isOpen) {
      setId("");
      setName("");
      setAmount(0);
      setLimit("");
      setDescription("");
      setIsCovered(false);
      setCoverageType("");
      setCoverageValue("");
    }
  }, [isOpen, unit]);
  const handlesubmit = async () => {
    try {
      setLoading(true);

      const payload: Record<string, string | number | boolean | undefined> = {
        name: name.trim(),
        description: description.trim(),
        isCovered: isCovered,
      };

      // Only include amount and limit if not covered
      if (!isCovered) {
        payload.amount = amount;
        payload.limit = limit.trim();
      } else {
        // If covered, include coverage type and value
        if (coverageType) {
          payload.coverageType = coverageType;
          if (coverageType !== "unlimited") {
            payload.coverageValue = coverageValue;
          }
        }
        // Amount is optional for covered benefits
        if (amount) {
          payload.amount = amount;
        }
      }

      const url = `/admin/benefits/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateUser(id, {
        name: name,
        description: description,
        amount: amount,
        limit: limit,
        isCovered: isCovered,
        coverageType: coverageType,
        coverageValue: coverageValue,
      });

      successModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };
  const handleMessageChange = (value: string) => {
    setDescription(value);
  };
  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Benefit
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the benefit details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-auto sm:h-auto overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                />
              </div>

              {/* Coverage Type Section */}
              <div className="col-span-2 lg:col-span-1">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isCovered}
                    onChange={(e) => {
                      setIsCovered(e.target.checked);
                      if (!e.target.checked) {
                        setCoverageType("");
                        setCoverageValue("");
                      }
                    }}
                    className="w-4 h-4"
                  />
                  Mark as Covered
                </Label>
              </div>

              {/* Conditional Fields */}
              {isCovered ? (
                <>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Coverage Type</Label>
                    <Select
                      options={[
                        { value: "times_per_year", label: "Times Per Year" },
                        { value: "times_per_month", label: "Times Per Month" },
                        { value: "quarterly", label: "Quarterly" },
                        { value: "unlimited", label: "Unlimited" },
                        { value: "amount_based", label: "Amount Based" },
                        { value: "limit_based", label: "Limit Based" },
                      ]}
                      placeholder="Select coverage type"
                      onChange={(value) => {
                        setCoverageType(value as string);
                        if (value === "unlimited") {
                          setCoverageValue("");
                        }
                      }}
                      defaultValue={coverageType}
                    />
                  </div>

                  {coverageType && coverageType !== "unlimited" && (
                    <div className="col-span-2 lg:col-span-1">
                      <Label>
                        Coverage Value{" "}
                        {coverageType === "amount_based" && "(Amount)"}
                        {coverageType === "times_per_year" &&
                          "(Number of times)"}
                        {coverageType === "times_per_month" &&
                          "(Number of times)"}
                        {coverageType === "quarterly" &&
                          "(e.g., Q1, Q2, Q3, Q4)"}
                        {coverageType === "limit_based" && "(Limit)"}
                      </Label>
                      <Input
                        type={
                          coverageType === "amount_based" ? "number" : "text"
                        }
                        placeholder="Enter coverage value"
                        value={coverageValue}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setCoverageValue(e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Amount (Optional)</Label>
                    <Input
                      type="number"
                      placeholder="Optional amount"
                      value={amount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAmount(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setAmount(
                          e.target.value === "" ? 0 : Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Limit</Label>
                    <Input
                      type="number"
                      value={limit}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setLimit(e.target.value)
                      }
                    />
                  </div>
                </>
              )}

              <div className="col-span-2 ">
                <Label>Description</Label>
                <TextArea
                  placeholder="Type your message here..."
                  rows={6}
                  value={description}
                  onChange={handleMessageChange}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-6 px-2 mt-6 sm:flex-row sm:justify-between">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <div className="flex -space-x-2"></div>
              </div>

              <div className="flex items-center w-full gap-3 sm:w-auto">
                <button
                  onClick={closeModal}
                  type="button"
                  className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={handlesubmit}
                  type="button"
                  className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
                >
                  Update Benefit
                </button>
              </div>
            </div>
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
    </>
  );
}
