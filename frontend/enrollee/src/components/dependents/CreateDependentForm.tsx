"use client";

import { createDependent } from "@/lib/apis/dependent";
import { useState } from "react";

interface CreateDependentFormProps {
  onSuccess?: () => void;
}

const CreateDependentForm: React.FC<CreateDependentFormProps> = ({
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    policyNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    relationshipToEnrollee: "",
    phoneNumber: "",
    email: "",
    occupation: "",
    maritalStatus: "",
    preexistingMedicalRecords: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.policyNumber)
      newErrors.policyNumber = "Policy number is required";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.relationshipToEnrollee)
      newErrors.relationshipToEnrollee = "Relationship is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await createDependent({
        policyNumber: formData.policyNumber,
        firstName: formData.firstName,
        middleName: formData.middleName || undefined,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as "male" | "female" | "other",
        relationshipToEnrollee: formData.relationshipToEnrollee as
          | "spouse"
          | "child"
          | "parent"
          | "sibling"
          | "other",
        phoneNumber: formData.phoneNumber || undefined,
        email: formData.email || undefined,
        occupation: formData.occupation || undefined,
        maritalStatus: formData.maritalStatus as
          | "single"
          | "married"
          | "divorced"
          | "widowed"
          | "separated"
          | undefined,
        preexistingMedicalRecords:
          formData.preexistingMedicalRecords || undefined,
        notes: formData.notes || undefined,
      });

      setFormData({
        policyNumber: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        relationshipToEnrollee: "",
        phoneNumber: "",
        email: "",
        occupation: "",
        maritalStatus: "",
        preexistingMedicalRecords: "",
        notes: "",
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to create dependent", err);
      alert("Failed to add dependent. Please try again.");
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Policy Number & Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Policy Number *
          </label>
          <input
            type="text"
            name="policyNumber"
            value={formData.policyNumber}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
              errors.policyNumber ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter policy number"
          />
          {errors.policyNumber && (
            <p className="text-red-500 text-xs mt-1">{errors.policyNumber}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            First Name *
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
              errors.firstName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="First name"
          />
          {errors.firstName && (
            <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Middle Name
          </label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
            placeholder="Middle name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
              errors.lastName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Last name"
          />
          {errors.lastName && (
            <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
          )}
        </div>
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
              errors.dateOfBirth ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Gender *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Relationship */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Relationship to Enrollee *
        </label>
        <select
          name="relationshipToEnrollee"
          value={formData.relationshipToEnrollee}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700 ${
            errors.relationshipToEnrollee ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select relationship</option>
          <option value="spouse">Spouse</option>
          <option value="child">Child</option>
          <option value="parent">Parent</option>
          <option value="sibling">Sibling</option>
          <option value="other">Other</option>
        </select>
        {errors.relationshipToEnrollee && (
          <p className="text-red-500 text-xs mt-1">
            {errors.relationshipToEnrollee}
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
            placeholder="Phone number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
            placeholder="Email address"
          />
        </div>
      </div>

      {/* Occupation & Marital Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Occupation
          </label>
          <input
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
            placeholder="Occupation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Marital Status
          </label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
          >
            <option value="">Select status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
        </div>
      </div>

      {/* Medical Records */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pre-existing Medical Records
        </label>
        <textarea
          name="preexistingMedicalRecords"
          value={formData.preexistingMedicalRecords}
          onChange={handleChange}
          placeholder="Any pre-existing medical conditions or records"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Any additional information"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-900 dark:text-white dark:border-gray-700"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 rounded-lg bg-brand-500 text-white hover:bg-brand-600 disabled:opacity-50 dark:bg-brand-600 dark:hover:bg-brand-700 font-medium"
        >
          {loading ? "Adding..." : "Add Dependent"}
        </button>
      </div>
    </form>
  );
};

export default CreateDependentForm;
