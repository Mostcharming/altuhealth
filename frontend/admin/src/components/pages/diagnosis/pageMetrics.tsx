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
import { useDiagnosisStore } from "@/lib/store/diagnosisStore";
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
  const addPlan = useDiagnosisStore((s) => s.addDiagnosis);

  // form state

  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [severity, setSeverity] = useState<
    "mild" | "moderate" | "severe" | "critical" | ""
  >("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [isChronicCondition, setIsChronicCondition] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save diagnosis. Please try again."
  );

  const resetForm = () => {
    setDescription("");
    setName("");
    setSeverity("");
    setSymptoms("");
    setTreatment("");
    setIsChronicCondition(false);
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

      const payload: {
        name: string;
        description: string;
        severity?: string;
        symptoms?: string;
        treatment?: string;
        isChronicCondition: boolean;
      } = {
        name: name.trim(),
        description: description.trim(),
        severity: severity || undefined,
        symptoms: symptoms.trim() || undefined,
        treatment: treatment.trim() || undefined,
        isChronicCondition: isChronicCondition,
      };

      const data = await apiClient("/admin/diagnosis", {
        method: "POST",
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      // if backend returns created admin id or object, you can handle it here
      // Optionally, if a unit was created/returned and you want to add to unit store
      if (data?.data?.diagnosis) {
        addPlan({
          id: data.data.diagnosis.id,
          name: name,
          description: description,
          severity: severity || null,
          symptoms: symptoms || null,
          treatment: treatment || null,
          isChronicCondition: isChronicCondition,
          createdAt: data.data.diagnosis.createdAt,
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
            Add a new Diagnosis
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to create a new diagnosis.
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
                <Label>Name</Label>
                <Input
                  type="text"
                  value={name}
                  placeholder="Enter diagnosis name..."
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setName(e.target.value)
                  }
                />
              </div>

              <div className="col-span-2 lg:col-span-1">
                <Label>Severity</Label>
                <Select
                  options={[
                    // { value: "", label: "Select severity" },
                    { value: "mild", label: "Mild" },
                    { value: "moderate", label: "Moderate" },
                    { value: "severe", label: "Severe" },
                    { value: "critical", label: "Critical" },
                  ]}
                  placeholder="Select severity"
                  onChange={(value) =>
                    setSeverity(
                      value as "mild" | "moderate" | "severe" | "critical" | ""
                    )
                  }
                  defaultValue={severity}
                />
              </div>

              <div className="col-span-2">
                <Label>Description</Label>
                <TextArea
                  placeholder="Type the description here..."
                  rows={4}
                  value={description}
                  onChange={handleMessageChange}
                />
              </div>

              <div className="col-span-2">
                <Label>Symptoms</Label>
                <TextArea
                  placeholder="Enter symptoms..."
                  rows={4}
                  value={symptoms}
                  onChange={(value) => setSymptoms(value)}
                />
              </div>

              <div className="col-span-2">
                <Label>Treatment</Label>
                <TextArea
                  placeholder="Enter treatment details..."
                  rows={4}
                  value={treatment}
                  onChange={(value) => setTreatment(value)}
                />
              </div>

              <div className="col-span-2">
                <Checkbox
                  label="Is Chronic Condition"
                  checked={isChronicCondition}
                  onChange={(checked) => setIsChronicCondition(checked)}
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
                  {loading ? "Creating..." : "Create Diagnosis"}
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
