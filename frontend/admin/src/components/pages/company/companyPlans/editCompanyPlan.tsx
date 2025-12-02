"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { createCompanyPlan, updateCompanyPlan } from "@/lib/apis/companyPlan";
import { fetchPlans, Plan } from "@/lib/apis/plan";
import { CompanyPlan, useCompanyPlanStore } from "@/lib/store/companyPlanStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditCompanyPlanProps {
  isOpen: boolean;
  closeModal: () => void;
  plan?: CompanyPlan | null;
  companyId: string;
  onSuccess?: () => void;
}

export default function EditCompanyPlan({
  isOpen,
  closeModal,
  plan,
  companyId,
  onSuccess,
}: EditCompanyPlanProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState("");
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
  const [description, setDescription] = useState("");
  const [allowDependentEnrolee, setAllowDependentEnrolee] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save company plan. Please try again."
  );
  const [planOptions, setPlanOptions] = useState<
    { value: string; label: string }[]
  >([]);

  const updatePlanStore = useCompanyPlanStore((s) => s.updatePlan);
  const addPlanStore = useCompanyPlanStore((s) => s.addPlan);

  const planCycleOptions = [
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "annual", label: "Annual" },
  ];

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
    onSuccess?.();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetchPlans({ limit: "all", isActive: true });
        const plans = response?.data?.list || [];
        const options = plans.map((p: Plan) => ({
          value: p.id,
          label: p.name,
        }));
        setPlanOptions(options);
      } catch (err) {
        console.warn("Failed to fetch plans", err);
      }
    };
    loadPlans();
  }, []);

  useEffect(() => {
    if (isOpen && plan) {
      setId(plan.id ?? "");
      setName(plan.name ?? "");
      setPlanId(plan.planId ?? "");
      setPlanCycle(plan.planCycle ?? "");
      setAnnualPremiumPrice(plan.annualPremiumPrice ?? 0);
      setAgeLimit(plan.ageLimit);
      setDependentAgeLimit(plan.dependentAgeLimit);
      setMaxNumberOfDependents(plan.maxNumberOfDependents);
      setDiscountPerEnrolee(plan.discountPerEnrolee);
      setDescription(plan.description ?? "");
      setAllowDependentEnrolee(plan.allowDependentEnrolee ?? true);
      setIsActive(plan.isActive ?? true);
    }

    if (!isOpen) {
      setId("");
      setName("");
      setPlanId("");
      setPlanCycle("");
      setAnnualPremiumPrice(0);
      setAgeLimit(undefined);
      setDependentAgeLimit(undefined);
      setMaxNumberOfDependents(undefined);
      setDiscountPerEnrolee(undefined);
      setDescription("");
      setAllowDependentEnrolee(true);
      setIsActive(true);
    }
  }, [isOpen, plan]);

  const handleSubmit = async () => {
    try {
      if (!name.trim()) {
        setErrorMessage("Plan name is required.");
        errorModal.openModal();
        return;
      }

      if (!planId) {
        setErrorMessage("Plan is required.");
        errorModal.openModal();
        return;
      }

      if (!planCycle) {
        setErrorMessage("Plan cycle is required.");
        errorModal.openModal();
        return;
      }

      if (
        annualPremiumPrice === undefined ||
        annualPremiumPrice === null ||
        annualPremiumPrice <= 0
      ) {
        setErrorMessage("Annual premium price must be greater than 0.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        name: name.trim(),
        planId,
        planCycle,
        annualPremiumPrice: Number(annualPremiumPrice),
        ageLimit,
        dependentAgeLimit,
        maxNumberOfDependents,
        discountPerEnrolee,
        description: description.trim(),
        allowDependentEnrolee,
        ...(plan ? { isActive } : {}),
      };

      if (plan) {
        // Update existing plan
        await updateCompanyPlan(id, payload);
        updatePlanStore(id, payload);
      } else {
        // Create new plan
        const data = await createCompanyPlan({
          ...payload,
          companyId,
          isActive: true,
        } as Parameters<typeof createCompanyPlan>[0]);
        if (data?.data?.companyPlan) {
          addPlanStore(data.data.companyPlan);
        }
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
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {plan ? "Edit Company Plan" : "Create New Company Plan"}
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            {plan
              ? "Update the plan details below."
              : "Fill in the details below to create a new company plan."}
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div className="col-span-2 lg:col-span-1">
                <Label>Plan Name *</Label>
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
                <Label>Plan Type *</Label>
                <Select
                  options={planOptions}
                  placeholder="Select plan type"
                  onChange={(val) => setPlanId(val)}
                  defaultValue={planId}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Plan Cycle *</Label>
                <Select
                  options={planCycleOptions}
                  placeholder="Select plan cycle"
                  onChange={(val) => setPlanCycle(val)}
                  defaultValue={planCycle}
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Annual Premium Price *</Label>
                <Input
                  type="number"
                  value={annualPremiumPrice}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAnnualPremiumPrice(Number(e.target.value))
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
                <Label>Description</Label>
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

              {plan && (
                <div className="col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      label="Status"
                      checked={isActive}
                      onChange={(checked) => setIsActive(checked)}
                    />

                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              )}
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
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {loading ? "Saving..." : plan ? "Update" : "Create"}
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
    </>
  );
}
