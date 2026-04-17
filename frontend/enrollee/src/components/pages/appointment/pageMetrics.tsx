"use client";

import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import { Modal } from "@/components/ui/modal";
import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { useModal } from "@/hooks/useModal";
import { createAppointment, fetchProviders } from "@/lib/apis/appointment";
import capitalizeWords from "@/lib/capitalize";
import { ChangeEvent, useEffect, useState } from "react";

interface Provider {
  id: string;
  name: string;
  code?: string;
  category?: string;
}

export default function PageMetricsAppointments({
  buttonText = "Book an Appointment",
}: {
  buttonText?: string;
}) {
  const { isOpen, openModal, closeModal } = useModal();
  const [loading, setLoading] = useState(false);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providers, setProviders] = useState<Provider[]>([]);

  const errorModal = useModal();
  const successModal = useModal();

  // form state
  const [providerId, setProviderId] = useState("");
  const [complaint, setComplaint] = useState("");
  const [appointmentDateTime, setAppointmentDateTime] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to create appointment. Please try again."
  );

  // Fetch providers on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProviders(true);
        const providersData = await fetchProviders({ limit: "all" });
        if (
          providersData?.data?.list &&
          Array.isArray(providersData.data.list)
        ) {
          const providersList = providersData.data.list.map((p: Provider) => ({
            id: p.id,
            name: p.name,
            code: p.code,
            category: p.category,
          }));
          setProviders(providersList);
        }
      } catch (err) {
        console.error("Failed to fetch providers", err);
        setErrorMessage("Failed to load providers. Please try again.");
        errorModal.openModal();
      } finally {
        setLoadingProviders(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const resetForm = () => {
    setProviderId("");
    setComplaint("");
    setAppointmentDateTime("");
    setNotes("");
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    resetForm();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const handlesubmit = async () => {
    try {
      // simple client-side validation
      if (!providerId.trim()) {
        setErrorMessage("Provider is required.");
        errorModal.openModal();
        return;
      }

      if (!appointmentDateTime.trim()) {
        setErrorMessage("Appointment date and time is required.");
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        providerId: providerId.trim(),
        complaint: complaint.trim() || undefined,
        appointmentDateTime: appointmentDateTime.trim(),
        notes: notes.trim() || undefined,
      };

      const data = await createAppointment(payload);

      if (data?.data?.appointment || data?.appointment) {
        successModal.openModal();
      }
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  const providerOptions = providers.map((p) => ({
    value: p.id,
    label: `${capitalizeWords(p.name)}${p.code ? ` (${p.code})` : ""}`,
  }));

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30); // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="p-4 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div></div>
        <div>
          <button
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
          </button>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10 m-4"
      >
        <div className="px-2">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            Book an Appointment
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Fill in the details below to book a new appointment with a
            healthcare provider.
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
            <div className="grid grid-cols-1 gap-x-6 gap-y-5">
              {/* Provider Selection */}
              <div>
                <Label htmlFor="providerId">
                  Select Provider <span className="text-red-500">*</span>
                </Label>
                {loadingProviders ? (
                  <div className="py-2">
                    <SpinnerThree />
                  </div>
                ) : (
                  <Select
                    options={providerOptions}
                    onChange={(value: string) => setProviderId(value)}
                    placeholder="-- Select a provider --"
                    defaultValue={providerId}
                  />
                )}
              </div>

              {/* Appointment Date and Time */}
              <div>
                <Label htmlFor="appointmentDateTime">
                  Appointment Date & Time{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <input
                  id="appointmentDateTime"
                  type="datetime-local"
                  value={appointmentDateTime}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setAppointmentDateTime(e.target.value)
                  }
                  min={getMinDateTime()}
                  placeholder="Select date and time"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500"
                />
              </div>

              {/* Complaint / Reason */}
              <div>
                <Label htmlFor="complaint">Reason for Visit</Label>
                <textarea
                  id="complaint"
                  value={complaint}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setComplaint(e.target.value)
                  }
                  placeholder="Describe your complaint or reason for the appointment"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Any additional information for the provider"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 transition focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-brand-500"
                />
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
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 sm:w-auto"
            >
              {loading ? "Booking..." : "Book Appointment"}
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
