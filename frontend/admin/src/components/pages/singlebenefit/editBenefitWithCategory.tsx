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

interface BenefitCategory {
  value: string;
  label: string;
}

interface EditBenefitWithCategoryProps {
  isOpen: boolean;
  closeModal: () => void;
  benefit?: Benefit | null;
}

export default function EditBenefitWithCategory({
  isOpen,
  closeModal,
  benefit,
}: EditBenefitWithCategoryProps) {
  const [loading, setLoading] = useState(false);
  //   const [categoriesLoading, setCategoriesLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();

  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState("");
  const [amount, setAmount] = useState<number>(0);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<BenefitCategory[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>(
    "Failed to update benefit."
  );

  const updateBenefit = useBenefitStore((s) => s.updateBenefit);

  // Fetch benefit categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // setCategoriesLoading(true);
        const data = await apiClient(
          "/admin/benefit-categories/list?limit=all",
          {
            method: "GET",
          }
        );
        const items = data?.data?.list || data?.data || [];
        const categoryOptions = Array.isArray(items)
          ? items.map((cat: any) => ({
              value: cat.id,
              label: cat.name,
            }))
          : [];
        setCategories(categoryOptions);
      } catch (err) {
        console.warn("Failed to fetch benefit categories", err);
      } finally {
        // setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  // When the modal opens with a benefit, populate the form with its data.
  useEffect(() => {
    if (isOpen && benefit) {
      setId(benefit.id ?? "");
      setName(benefit.name ?? "");
      setAmount(benefit.amount ?? 0);
      setLimit(benefit.limit ?? "");
      setDescription(benefit.description ?? "");
      setSelectedCategoryId(benefit.benefitCategoryId ?? "");
    }

    if (!isOpen) {
      setId("");
      setName("");
      setAmount(0);
      setLimit("");
      setDescription("");
      setSelectedCategoryId("");
    }
  }, [isOpen, benefit]);

  const handlesubmit = async () => {
    try {
      // Validate category selection
      if (!selectedCategoryId) {
        setErrorMessage("Please select a benefit category.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        name: string;
        description: string;
        amount: number;
        limit: string;
        benefitCategoryId: string;
      } = {
        name: name.trim(),
        description: description.trim(),
        amount: amount,
        limit: limit.trim(),
        benefitCategoryId: selectedCategoryId,
      };

      const url = `/admin/benefits/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateBenefit(id, {
        name: name,
        description: description,
        amount: amount,
        limit: limit,
        benefitCategoryId: selectedCategoryId,
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
                <Label>Benefit Category</Label>
                <Select
                  options={categories}
                  placeholder="Select a benefit category"
                  onChange={(value) => setSelectedCategoryId(value as string)}
                  defaultValue={selectedCategoryId}
                  //   disabled={categoriesLoading}
                />
              </div>
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
              <div className="col-span-2">
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
