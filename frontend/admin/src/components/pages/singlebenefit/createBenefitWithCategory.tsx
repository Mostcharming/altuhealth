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
import { useBenefitStore } from "@/lib/store/benefitStore";
import { ChangeEvent, useEffect, useState } from "react";

interface BenefitCategory {
  value: string;
  label: string;
}

export default function CreateBenefitWithCategory({
  buttonText,
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);

  const errorModal = useModal();
  const successModal = useModal();

  // stores
  const addBenefit = useBenefitStore((s) => s.addBenefit);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [limit, setLimit] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categories, setCategories] = useState<BenefitCategory[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>(
    "Failed to create benefit."
  );

  // Fetch benefit categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
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
      }
    };
    fetchCategories();
  }, []);

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setLimit("");
    setName("");
    setSelectedCategoryId("");
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    resetForm();
    closeModal();
  };

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!name) {
        setErrorMessage("Name is required.");
        errorModal.openModal();
        return;
      }

      if (!selectedCategoryId) {
        setErrorMessage("Please select a benefit category.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        name: string;
        description: string;
        limit: number;
        amount: number;
        benefitCategoryId: string;
      } = {
        name: name.trim(),
        description: description.trim(),
        limit: parseInt(limit) || 0,
        amount: parseFloat(amount) || 0,
        benefitCategoryId: selectedCategoryId,
      };

      const data = await apiClient("/admin/benefits", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      if (data) {
        // const selectedCategory = categories.find(
        //   (cat) => cat.value === selectedCategoryId
        // );
        addBenefit({
          id: data.data.id,
          name: name,
          description: description,
          limit: limit,
          amount: parseFloat(amount),
          benefitCategoryId: selectedCategoryId,
          createdAt: data.data.createdAt,
          BenefitCategory: {
            id: selectedCategoryId,
            name:
              categories.find((cat) => cat.value === selectedCategoryId)
                ?.label || "",
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
                    setAmount(e.target.value)
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
