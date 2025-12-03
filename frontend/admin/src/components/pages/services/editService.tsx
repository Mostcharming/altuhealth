"use client";

import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { apiClient } from "@/lib/apiClient";
import { Service, useServiceStore } from "@/lib/store/serviceStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditServiceProps {
  isOpen: boolean;
  closeModal: () => void;
  service?: Service | null;
}

export default function EditService({
  isOpen,
  closeModal,
  service,
}: EditServiceProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [requiresPreauthorization, setRequiresPreauthorization] =
    useState(false);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "pending">(
    "pending"
  );
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save service. Please try again."
  );

  const updateService = useServiceStore((s) => s.updateService);

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  useEffect(() => {
    if (isOpen && service) {
      setId(service.id ?? "");
      setName(service.name ?? "");
      setCode(service.code ?? "");
      setDescription(service.description ?? "");
      setRequiresPreauthorization(service.requiresPreauthorization ?? false);
      setPrice(service.price?.toString() ?? "");
      setStatus(service.status ?? "pending");
    }

    if (!isOpen) {
      setId("");
      setName("");
      setCode("");
      setDescription("");
      setRequiresPreauthorization(false);
      setPrice("");
      setStatus("pending");
    }
  }, [isOpen, service]);

  const handlesubmit = async () => {
    try {
      if (!name) {
        setErrorMessage("Name is required.");
        errorModal.openModal();
        return;
      }
      if (!price) {
        setErrorMessage("Price is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload: {
        name: string;
        code?: string;
        description?: string;
        requiresPreauthorization: boolean;
        price: number;
        status: string;
      } = {
        name: name.trim(),
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        requiresPreauthorization: requiresPreauthorization,
        price: parseFloat(price),
        status,
      };

      const url = `/admin/services/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateService(id, {
        name: name,
        code: code,
        description: description || null,
        requiresPreauthorization: requiresPreauthorization,
        price: parseFloat(price),
        status: status,
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[900px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Edit Service
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the service details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[350px] sm:h-[450px] overflow-y-auto px-2">
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

              <div className="col-span-2 lg:col-span-1">
                <Label>Code</Label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setCode(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Price</Label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setPrice(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Status</Label>
                <Select
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "pending", label: "Pending" },
                  ]}
                  placeholder="Select status"
                  onChange={(value) =>
                    setStatus(value as "active" | "inactive" | "pending")
                  }
                  defaultValue={status}
                />
              </div>

              <div className="col-span-2">
                <Label>Description</Label>
                <TextArea
                  placeholder="Type the description here..."
                  rows={4}
                  value={description}
                  onChange={(value) => setDescription(value)}
                />
              </div>

              <div className="col-span-2">
                <Checkbox
                  label="Requires Preauthorization"
                  checked={requiresPreauthorization}
                  onChange={(checked) => setRequiresPreauthorization(checked)}
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
                  type="button"
                  onClick={handlesubmit}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-brand-500 text-white"
                >
                  {loading ? "Saving..." : "Save Changes"}
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
