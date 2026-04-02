"use client";

import { useModal } from "@/hooks/useModal";
import { referralProgramAPI } from "@/lib/apis/referral";
import { useState } from "react";

interface FormData {
  name: string;
  description: string;
  rewardType: "fixed" | "percentage";
  fixedRate: string;
  percentageRate: string;
  capAmount: string;
  minimumPayout: string;
  startDate: string;
  endDate: string;
  maxReferralsPerReferrer: string;
  maxTotalPayout: string;
  picture: string;
}

const ReferralConfigurationForm = () => {
  const successModal = useModal();
  const errorModal = useModal();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    rewardType: "fixed",
    fixedRate: "",
    percentageRate: "",
    capAmount: "",
    minimumPayout: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    maxReferralsPerReferrer: "",
    maxTotalPayout: "",
    picture: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate required fields
      if (!formData.name || !formData.startDate) {
        setErrorMessage("Name and start date are required");
        errorModal.openModal();
        return;
      }

      if (formData.rewardType === "fixed" && !formData.fixedRate) {
        setErrorMessage("Fixed rate is required for fixed reward type");
        errorModal.openModal();
        return;
      }

      if (formData.rewardType === "percentage" && !formData.percentageRate) {
        setErrorMessage(
          "Percentage rate is required for percentage reward type"
        );
        errorModal.openModal();
        return;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        rewardType: formData.rewardType,
        fixedRate: formData.fixedRate ? parseFloat(formData.fixedRate) : null,
        percentageRate: formData.percentageRate
          ? parseFloat(formData.percentageRate)
          : null,
        capAmount: formData.capAmount ? parseFloat(formData.capAmount) : null,
        minimumPayout: parseFloat(formData.minimumPayout) || 0,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
        maxReferralsPerReferrer: formData.maxReferralsPerReferrer
          ? parseInt(formData.maxReferralsPerReferrer)
          : null,
        maxTotalPayout: formData.maxTotalPayout
          ? parseFloat(formData.maxTotalPayout)
          : null,
        picture: formData.picture,
      };

      const data = await referralProgramAPI.createProgram(payload);

      if (data.success) {
        successModal.openModal();
        // Reset form
        setFormData({
          name: "",
          description: "",
          rewardType: "fixed",
          fixedRate: "",
          percentageRate: "",
          capAmount: "",
          minimumPayout: "",
          startDate: new Date().toISOString().split("T")[0],
          endDate: "",
          maxReferralsPerReferrer: "",
          maxTotalPayout: "",
          picture: "",
        });
      } else {
        setErrorMessage(data.message || "Failed to create referral program");
        errorModal.openModal();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "An error occurred"
      );
      errorModal.openModal();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
      <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                placeholder="e.g., AltuHealth Referral Program 2026"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                placeholder="Describe the referral program..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Picture URL
              </label>
              <input
                type="url"
                name="picture"
                value={formData.picture}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Reward Configuration */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Reward Configuration
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reward Type *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rewardType"
                    value="fixed"
                    checked={formData.rewardType === "fixed"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Fixed Amount
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="rewardType"
                    value="percentage"
                    checked={formData.rewardType === "percentage"}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Percentage
                  </span>
                </label>
              </div>
            </div>

            {formData.rewardType === "fixed" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fixed Rate (₦) *
                </label>
                <input
                  type="number"
                  name="fixedRate"
                  value={formData.fixedRate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                  placeholder="e.g., 500"
                  step="0.01"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Percentage Rate (%) *
                </label>
                <input
                  type="number"
                  name="percentageRate"
                  value={formData.percentageRate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                  placeholder="e.g., 2.5"
                  step="0.01"
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cap Amount (₦)
                </label>
                <input
                  type="number"
                  name="capAmount"
                  value={formData.capAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                  placeholder="e.g., 10000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Payout (₦)
                </label>
                <input
                  type="number"
                  name="minimumPayout"
                  value={formData.minimumPayout}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                  placeholder="e.g., 1000"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Program Duration & Limits */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Program Duration & Limits
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Referrals Per Referrer
                </label>
                <input
                  type="number"
                  name="maxReferralsPerReferrer"
                  value={formData.maxReferralsPerReferrer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                  placeholder="e.g., 100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Total Payout (₦)
                </label>
                <input
                  type="number"
                  name="maxTotalPayout"
                  value={formData.maxTotalPayout}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 text-sm"
                  placeholder="e.g., 1000000"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 disabled:opacity-50 transition"
          >
            {loading ? "Creating..." : "Create Referral Program"}
          </button>
          <button
            type="button"
            className="px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReferralConfigurationForm;
