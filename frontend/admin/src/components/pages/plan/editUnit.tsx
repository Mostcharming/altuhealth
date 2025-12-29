/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Plan, usePlanStore } from "@/lib/store/planStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditUnitProps {
  isOpen: boolean;
  closeModal: () => void;
  unit?: Plan | null;
}

export default function EditUnit({ isOpen, closeModal, unit }: EditUnitProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();

  const [id, setId] = useState<string>("");
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
  const [isActive, setIsActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to update plan. Please try again."
  );

  const updateUser = usePlanStore((s) => s.updatePlan);

  const planCycleOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annual", label: "Annual" },
  ];

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  // When the modal opens with a plan, populate the form with its data.
  useEffect(() => {
    if (isOpen && unit) {
      setId(unit.id ?? "");
      setName(unit.name ?? "");
      setCode(unit.code ?? "");
      setDescription(unit.description ?? "");
      setPlanCycle(unit.planCycle ?? "");
      setAnnualPremiumPrice(unit.annualPremiumPrice);
      setAgeLimit(unit.ageLimit);
      setDependentAgeLimit(unit.dependentAgeLimit);
      setMaxNumberOfDependents(unit.maxNumberOfDependents);
      setDiscountPerEnrolee(unit.discountPerEnrolee);
      setAllowDependentEnrolee(unit.allowDependentEnrolee ?? true);
      setIsActive(unit.isActive ?? false);
    }

    if (!isOpen) {
      setId("");
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
      setIsActive(false);
    }
  }, [isOpen, unit]);

  const handlesubmit = async () => {
    try {
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
        isActive,
      };

      const url = `/admin/plans/${id}`;

      await apiClient(url, {
        method: "PUT",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateUser(id, payload);

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
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Plan
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the plan details below.
          </p>
        </div>

        <form className="flex flex-col">
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

              <div className="col-span-2 lg:col-span-1">
                <Label>Status</Label>
                <Select
                  options={[
                    { value: "true", label: "Active" },
                    { value: "false", label: "Inactive" },
                  ]}
                  placeholder="Select status"
                  onChange={(val) => setIsActive(val === "true")}
                  defaultValue={isActive ? "true" : "false"}
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
                  {loading ? "Saving..." : "Update Plan"}
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
