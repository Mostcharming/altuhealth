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
import { useBenefitStore } from "@/lib/store/benefitStore";
import { ChangeEvent, useState } from "react";

export default function PageMetricsUnits({
  id,
  buttonText,
}: {
  buttonText?: string;
  id: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addPlan = useBenefitStore((s) => s.addBenefit);

  // form state

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCovered, setIsCovered] = useState(true);
  const [coverageType, setCoverageType] = useState("");
  const [coverageValue, setCoverageValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>(
    "Failed to create benefit."
  );

  const resetForm = () => {
    setDescription("");
    setName("");
    setIsCovered(true);
    setCoverageType("");
    setCoverageValue("");
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    // resetForm();
    // closeModal();
  };

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!name) {
        setErrorMessage("Name is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: Record<string, string | number | boolean | undefined> = {
        name: name.trim(),
        description: description.trim(),
        benefitCategoryId: id,
        isCovered: isCovered,
      };

      // If covered, include coverage type and value
      if (isCovered) {
        if (coverageType) {
          payload.coverageType = coverageType;
          if (coverageType !== "unlimited") {
            payload.coverageValue = coverageValue;
          }
        }
      }

      const data = await apiClient("/admin/benefits", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data?.data) {
        addPlan({
          id: data.data.id,
          name: name,
          description: description,
          benefitCategoryId: id,
          isCovered: isCovered,
          coverageType: coverageType,
          coverageValue: coverageValue,
          createdAt: data.data.createdAt,
          BenefitCategory: {
            id: id,
            name: "",
          },
        });
      }

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
            Add a new Benefit
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new benefit.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handlesubmit();
          }}
        >
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
                </>
              ) : null}

              <div className="col-span-2 ">
                <Label>Description</Label>
                <TextArea
                  placeholder="Type your message here..."
                  rows={6}
                  value={description}
                  onChange={handleMessageChange}
                />
              </div>

              <div className="col-span-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded bg-brand-500 text-white"
                >
                  {loading ? "Creating..." : "Create Benefit"}
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
    </div>
  );
}
