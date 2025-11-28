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
import { Diagnosis, useDiagnosisStore } from "@/lib/store/diagnosisStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditUnitProps {
  isOpen: boolean;
  closeModal: () => void;
  unit?: Diagnosis | null;
}

export default function EditUnit({ isOpen, closeModal, unit }: EditUnitProps) {
  const [loading, setLoading] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<
    "mild" | "moderate" | "severe" | "critical" | ""
  >("");
  const [symptoms, setSymptoms] = useState("");
  const [treatment, setTreatment] = useState("");
  const [isChronicCondition, setIsChronicCondition] = useState(false);

  const updateDiagnosis = useDiagnosisStore((s) => s.updateDiagnosis);

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  // When the modal opens with a diagnosis, populate the form with its data.
  useEffect(() => {
    if (isOpen && unit) {
      setId(unit.id ?? "");
      setName(unit.name ?? "");
      setDescription(unit.description ?? "");
      setSeverity(unit.severity ?? "");
      setSymptoms(unit.symptoms ?? "");
      setTreatment(unit.treatment ?? "");
      setIsChronicCondition(unit.isChronicCondition ?? false);
    }

    if (!isOpen) {
      setId("");
      setName("");
      setDescription("");
      setSeverity("");
      setSymptoms("");
      setTreatment("");
      setIsChronicCondition(false);
    }
  }, [isOpen, unit]);

  const handlesubmit = async () => {
    try {
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

      const url = `/admin/diagnosis/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateDiagnosis(id, {
        name: name,
        description: description,
        severity: severity || null,
        symptoms: symptoms || null,
        treatment: treatment || null,
        isChronicCondition: isChronicCondition,
      });

      successModal.openModal();
    } catch (err) {
      console.warn("Save diagnosis failed", err);
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };
  const handleMessageChange = (value: string) => {
    setDescription(value);
  };

  const handleSymptomsChange = (value: string) => {
    setSymptoms(value);
  };

  const handleTreatmentChange = (value: string) => {
    setTreatment(value);
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
            Edit Diagnosis
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the diagnosis details.
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

              <div className="col-span-2 lg:col-span-1">
                <Label>Severity</Label>
                <Select
                  options={[
                    { value: "", label: "Select severity" },
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
                  onChange={handleSymptomsChange}
                />
              </div>

              <div className="col-span-2">
                <Label>Treatment</Label>
                <TextArea
                  placeholder="Enter treatment details..."
                  rows={4}
                  value={treatment}
                  onChange={handleTreatmentChange}
                />
              </div>

              <div className="col-span-2">
                <Checkbox
                  label="Is Chronic Condition"
                  checked={isChronicCondition}
                  onChange={(checked) => setIsChronicCondition(checked)}
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
                  Update Diagnosis
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

      <ErrorModal errorModal={errorModal} handleErrorClose={handleErrorClose} />
    </>
  );
}
