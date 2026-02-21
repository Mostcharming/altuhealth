"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { usePlanStore } from "@/lib/store/planStore";
import { ChangeEvent, useState } from "react";

export default function PageMetricsUnits({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addPlan = usePlanStore((s) => s.addPlan);

  // form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [planCycle, setPlanCycle] = useState("");
  const [annualPremiumPrice, setAnnualPremiumPrice] = useState<
    number | undefined
  >();
  const [ageLimit, setAgeLimit] = useState<number | undefined>();
  const [dependentAgeLimit, setDependentAgeLimit] = useState<
    number | undefined
  >();
  const [maxNumberOfDependents, setMaxNumberOfDependents] = useState<
    number | undefined
  >();
  const [discountPerEnrolee, setDiscountPerEnrolee] = useState<
    number | undefined
  >();
  const [allowDependentEnrolee, setAllowDependentEnrolee] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create plan. Please try again."
  );

  const planCycleOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annual", label: "Annual" },
  ];

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setPlanCycle("");
    setAnnualPremiumPrice(undefined);
    setAgeLimit(undefined);
    setDependentAgeLimit(undefined);
    setMaxNumberOfDependents(undefined);
    setDiscountPerEnrolee(undefined);
    setAllowDependentEnrolee(true);
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
      if (!name.trim()) {
        setErrorMessage("Plan name is required.");
        errorModal.openModal();
        return;
      }

      if (!code.trim()) {
        setErrorMessage("Plan code is required.");
        errorModal.openModal();
        return;
      }

      if (!description.trim()) {
        setErrorMessage("Plan description is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        planCycle,
        annualPremiumPrice: annualPremiumPrice
          ? Number(annualPremiumPrice)
          : undefined,
        ageLimit,
        dependentAgeLimit,
        maxNumberOfDependents,
        discountPerEnrolee,
        allowDependentEnrolee,
      };

      const data = await apiClient("/admin/plans", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      // if backend returns created plan id or object, add to store
      if (data?.data?.plan?.id) {
        addPlan({
          id: data.data.plan.id,
          name: name,
          code: code,
          description: description,
          planCycle,
          annualPremiumPrice,
          ageLimit,
          dependentAgeLimit,
          maxNumberOfDependents,
          discountPerEnrolee,
          allowDependentEnrolee,
          status: "pending",
          isActive: false,
          createdAt: new Date().toISOString(),
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
            Add a new plan
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new plan.
          </p>
        </div>

        <form
          className="flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            handlesubmit();
          }}
        >
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Name *</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                  placeholder="Enter plan name"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Code *</Label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCode(e.target.value)
                  }
                  placeholder="Enter plan code"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Plan Cycle</Label>
                <Select
                  options={planCycleOptions}
                  placeholder="Select plan cycle"
                  onChange={(val) => setPlanCycle(val)}
                  defaultValue={planCycle}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Annual Premium Price</Label>
                <Input
                  type="number"
                  value={annualPremiumPrice || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAnnualPremiumPrice(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter annual premium price"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Age Limit</Label>
                <Input
                  type="number"
                  value={ageLimit || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAgeLimit(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter age limit"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Dependent Age Limit</Label>
                <Input
                  type="number"
                  value={dependentAgeLimit || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDependentAgeLimit(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter dependent age limit"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Max Number of Dependents</Label>
                <Input
                  type="number"
                  value={maxNumberOfDependents || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMaxNumberOfDependents(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter max number of dependents"
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Discount Per Enrollee</Label>
                <Input
                  type="number"
                  value={discountPerEnrolee || ""}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setDiscountPerEnrolee(
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  placeholder="Enter discount per enrollee"
                />
              </div>

              <div className="col-span-2">
                <Label>Description *</Label>
                <textarea
                  value={description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Enter plan description"
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2.5 px-4 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                  rows={3}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3">
                  <Checkbox
                    label="Allow Dependent Enrollee"
                    checked={allowDependentEnrolee}
                    onChange={(checked) => setAllowDependentEnrolee(checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-2 pt-6 dark:border-gray-800">
            <button
              type="button"
              onClick={closeModal}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {loading ? "Creating..." : "Create Plan"}
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
