"use client";

import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { createAppointment, fetchProviders } from "@/lib/apis/appointment";
import { useEffect, useState } from "react";

interface CreateAppointmentFormProps {
  onSuccess?: () => void;
}

interface Provider {
  id: string;
  name: string;
  code?: string;
  category?: string;
}

const CreateAppointmentForm: React.FC<CreateAppointmentFormProps> = ({
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  const [formData, setFormData] = useState({
    providerId: "",
    companyId: "",
    subsidiaryId: "",
    complaint: "",
    appointmentDateTime: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingProviders(true);
        // Fetch providers - adjust the endpoint based on your API structure
        const providersData = await fetchProviders({ limit: 100 });
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
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchData();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.providerId) newErrors.providerId = "Provider is required";
    if (!formData.companyId) newErrors.companyId = "Company is required";
    if (!formData.appointmentDateTime)
      newErrors.appointmentDateTime = "Appointment date and time is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await createAppointment({
        providerId: formData.providerId,
        companyId: formData.companyId,
        subsidiaryId: formData.subsidiaryId || undefined,
        complaint: formData.complaint || undefined,
        appointmentDateTime: formData.appointmentDateTime,
        notes: formData.notes || undefined,
      });

      setFormData({
        providerId: "",
        companyId: "",
        subsidiaryId: "",
        complaint: "",
        appointmentDateTime: "",
        notes: "",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to create appointment", err);
      alert("Failed to create appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loadingProviders) {
    return <SpinnerThree />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Provider <span className="text-red-500">*</span>
        </label>
        <select
          name="providerId"
          value={formData.providerId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
            errors.providerId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">-- Select a provider --</option>
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.name} ({provider.code})
            </option>
          ))}
        </select>
        {errors.providerId && (
          <p className="text-red-500 text-sm mt-1">{errors.providerId}</p>
        )}
      </div>

      {/* Company Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select Company <span className="text-red-500">*</span>
        </label>
        <select
          name="companyId"
          value={formData.companyId}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
            errors.companyId ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">-- Select a company --</option>
          {/* Add your company options here */}
        </select>
        {errors.companyId && (
          <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
        )}
      </div>

      {/* Appointment Date and Time */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Appointment Date & Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          name="appointmentDateTime"
          value={formData.appointmentDateTime}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
            errors.appointmentDateTime ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.appointmentDateTime && (
          <p className="text-red-500 text-sm mt-1">
            {errors.appointmentDateTime}
          </p>
        )}
      </div>

      {/* Complaint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Complaint / Reason for Visit
        </label>
        <textarea
          name="complaint"
          value={formData.complaint}
          onChange={handleChange}
          placeholder="Describe your complaint or reason for the appointment"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information for the provider"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 justify-end">
        <button
          type="reset"
          onClick={() =>
            setFormData({
              providerId: "",
              companyId: "",
              subsidiaryId: "",
              complaint: "",
              appointmentDateTime: "",
              notes: "",
            })
          }
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <SpinnerThree /> : "Create Appointment"}
        </button>
      </div>
    </form>
  );
};

export default CreateAppointmentForm;
