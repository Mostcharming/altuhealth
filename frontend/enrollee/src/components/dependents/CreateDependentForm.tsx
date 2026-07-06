"use client";

import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import FileInput from "@/components/form/input/FileInput";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import { createDependent } from "@/lib/apis/dependent";
import { useState } from "react";

interface CreateDependentFormProps {
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const CreateDependentForm: React.FC<CreateDependentFormProps> = ({
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
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
    profilePicture: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

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
        profilePicture: formData.profilePicture || undefined,
      });

      setFormData({
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
        profilePicture: null,
      });
      setPreviewUrl(null);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to create dependent", err);
      const errorMessage =
        err instanceof Error ? err.message : "You cannot add more dependents";
      if (onError) {
        onError(errorMessage);
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const genderOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "other", label: "Other" },
  ];

  const relationshipOptions = [
    { value: "spouse", label: "Spouse" },
    { value: "child", label: "Child" },
    { value: "parent", label: "Parent" },
    { value: "sibling", label: "Sibling" },
    { value: "other", label: "Other" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "separated", label: "Separated" },
  ];

  const countries = [
    { code: "US", label: "+1" },
    { code: "CA", label: "+1" },
    { code: "GB", label: "+44" },
    { code: "AU", label: "+61" },
    { code: "IN", label: "+91" },
    { code: "NG", label: "+234" },
    { code: "DE", label: "+49" },
    { code: "FR", label: "+33" },
    { code: "ES", label: "+34" },
    { code: "IT", label: "+39" },
    { code: "BR", label: "+55" },
    { code: "MX", label: "+52" },
    { code: "CN", label: "+86" },
    { code: "JP", label: "+81" },
    { code: "ZA", label: "+27" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First name"
            error={!!errors.firstName}
            hint={errors.firstName}
          />
        </div>

        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            placeholder="Middle name"
          />
        </div>

        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last name"
            error={!!errors.lastName}
            hint={errors.lastName}
          />
        </div>
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <DatePicker
            id="dateOfBirth"
            label="Date of Birth *"
            placeholder="Select date of birth"
            onChange={(dates) => {
              if (dates && dates.length > 0) {
                const date = new Date(dates[0]);
                const formattedDate = date.toISOString().split("T")[0];
                setFormData((prev) => ({
                  ...prev,
                  dateOfBirth: formattedDate,
                }));
                if (errors.dateOfBirth) {
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.dateOfBirth;
                    return newErrors;
                  });
                }
              }
            }}
            defaultDate={formData.dateOfBirth}
          />
          {errors.dateOfBirth && (
            <p className="text-error-500 text-xs mt-1.5">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div>
          <Label>Gender *</Label>
          <Select
            options={genderOptions}
            placeholder="Select gender"
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, gender: value }));
              if (errors.gender) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.gender;
                  return newErrors;
                });
              }
            }}
            defaultValue={formData.gender}
          />
          {errors.gender && (
            <p className="text-error-500 text-xs mt-1.5">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Relationship */}
      <div>
        <Label>Relationship to Enrollee *</Label>
        <Select
          options={relationshipOptions}
          placeholder="Select relationship"
          onChange={(value) => {
            setFormData((prev) => ({
              ...prev,
              relationshipToEnrollee: value,
            }));
            if (errors.relationshipToEnrollee) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.relationshipToEnrollee;
                return newErrors;
              });
            }
          }}
          defaultValue={formData.relationshipToEnrollee}
        />
        {errors.relationshipToEnrollee && (
          <p className="text-error-500 text-xs mt-1.5">
            {errors.relationshipToEnrollee}
          </p>
        )}
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Phone Number</Label>
          <PhoneInput
            countries={countries}
            placeholder="+234 (0) 123-456-7890"
            defaultValue={formData.phoneNumber}
            defaultCountry="+234"
            onChange={(phoneNumber) =>
              setFormData((prev) => ({
                ...prev,
                phoneNumber,
              }))
            }
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email address"
          />
        </div>
      </div>

      {/* Occupation & Marital Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            type="text"
            name="occupation"
            value={formData.occupation}
            onChange={handleChange}
            placeholder="Occupation"
          />
        </div>

        <div>
          <Label>Marital Status</Label>
          <Select
            options={maritalStatusOptions}
            placeholder="Select status"
            onChange={(value) => {
              setFormData((prev) => ({ ...prev, maritalStatus: value }));
              if (errors.maritalStatus) {
                setErrors((prev) => {
                  const newErrors = { ...prev };
                  delete newErrors.maritalStatus;
                  return newErrors;
                });
              }
            }}
            defaultValue={formData.maritalStatus}
          />
        </div>
      </div>

      {/* Medical Records */}
      <div>
        <Label>Pre-existing Medical Records</Label>
        <TextArea
          value={formData.preexistingMedicalRecords}
          onChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              preexistingMedicalRecords: value,
            }))
          }
          placeholder="Any pre-existing medical conditions or records"
          rows={4}
        />
      </div>

      {/* Notes */}
      <div>
        <Label>Additional Notes</Label>
        <TextArea
          value={formData.notes}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, notes: value }))
          }
          placeholder="Any additional information"
          rows={3}
        />
      </div>

      {/* Profile Picture */}
      <div>
        <Label htmlFor="profilePicture">Profile Picture</Label>
        <FileInput
          id="profilePicture"
          name="profilePicture"
          onChange={handleFileChange}
          accept="image/*"
        />
        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Preview:
            </p>
            <img
              src={previewUrl}
              alt="Profile preview"
              className="w-24 h-24 rounded-lg object-cover"
            />
          </div>
        )}
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
