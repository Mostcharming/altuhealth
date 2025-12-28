/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import DatePicker from "@/components/form/date-picker";
import PhoneInput from "@/components/form/group-input/PhoneInput";
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
import { Staff, useStaffStore } from "@/lib/store/staffStore";
import { ChangeEvent, useEffect, useState } from "react";

interface EditStaffProps {
  isOpen: boolean;
  closeModal: () => void;
  staff?: Staff | null;
}

export default function EditStaff({
  isOpen,
  closeModal,
  staff,
}: EditStaffProps) {
  const [loading, setLoading] = useState(false);
  const [resendingNotification, setResendingNotification] = useState(false);
  const errorModal = useModal();
  const successModal = useModal();
  const notificationModal = useModal();
  const [id, setId] = useState<string>("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [subsidiaryId, setSubsidiaryId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [maxDependents, setMaxDependents] = useState("");
  const [preexistingMedicalRecords, setPreexistingMedicalRecords] =
    useState("");
  const [companyPlanId, setCompanyPlanId] = useState("");
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    "enrolled" | "not_enrolled"
  >("not_enrolled");
  const [isNotified, setIsNotified] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);
  const [subsidiaries, setSubsidiaries] = useState<any[]>([]);
  const [companyPlans, setCompanyPlans] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState(
    "Failed to save staff. Please try again."
  );

  const updateStaff = useStaffStore((s) => s.updateStaff);

  // countries for PhoneInput
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

  const handlePhoneChange = (v: string) => setPhoneNumber(v);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (companyId) {
      fetchSubsidiaries(companyId);
      fetchCompanyPlans(companyId);
    } else {
      setSubsidiaries([]);
      setCompanyPlans([]);
    }
  }, [companyId]);

  const fetchCompanies = async () => {
    try {
      const data = await apiClient("/admin/companies/list?limit=all", {
        method: "GET",
      });
      const companiesList = data?.data?.list || [];
      setCompanies(companiesList);
    } catch (err) {
      console.warn("Failed to fetch companies", err);
    }
  };

  const fetchSubsidiaries = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/company-subsidiaries/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        }
      );
      const subsidiariesList = data?.data?.list || [];
      setSubsidiaries(subsidiariesList);
    } catch (err) {
      console.warn("Failed to fetch subsidiaries", err);
    }
  };

  const fetchCompanyPlans = async (cId: string) => {
    try {
      const data = await apiClient(
        `/admin/company-plans/list?companyId=${cId}&limit=all`,
        {
          method: "GET",
        }
      );
      const plansList = data?.data?.list || [];
      setCompanyPlans(plansList);
    } catch (err) {
      console.warn("Failed to fetch company plans", err);
    }
  };

  // When the modal opens with a staff, populate the form with their data.
  useEffect(() => {
    if (isOpen && staff) {
      setId(staff.id ?? "");
      setFirstName(staff.firstName ?? "");
      setMiddleName(staff.middleName ?? "");
      setLastName(staff.lastName ?? "");
      setEmail(staff.email ?? "");
      setPhoneNumber(staff.phoneNumber ?? "");
      setStaffId(staff.staffId ?? "");
      setCompanyId(staff.companyId ?? "");
      setSubsidiaryId(staff.subsidiaryId ?? "");
      setDateOfBirth(staff.dateOfBirth ? staff.dateOfBirth.split("T")[0] : "");
      setMaxDependents(staff.maxDependents?.toString() ?? "");
      setPreexistingMedicalRecords(staff.preexistingMedicalRecords ?? "");
      setCompanyPlanId(staff.companyPlanId ?? "");
      setEnrollmentStatus(staff.enrollmentStatus ?? "not_enrolled");
      setIsNotified(staff.isNotified ?? false);
      setIsActive(staff.isActive ?? true);
    }

    if (!isOpen) {
      setId("");
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setPhoneNumber("");
      setStaffId("");
      setCompanyId("");
      setSubsidiaryId("");
      setDateOfBirth("");
      setMaxDependents("");
      setPreexistingMedicalRecords("");
      setCompanyPlanId("");
      setEnrollmentStatus("not_enrolled");
      setIsNotified(false);
      setIsActive(true);
    }
  }, [isOpen, staff]);

  const handlesubmit = async () => {
    try {
      setLoading(true);

      const payload: any = {
        firstName: firstName.trim(),
        middleName: middleName.trim() || undefined,
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        staffId: staffId.trim(),
        companyId,
        subsidiaryId: subsidiaryId || undefined,
        dateOfBirth: dateOfBirth || undefined,
        maxDependents: maxDependents ? parseInt(maxDependents) : undefined,
        preexistingMedicalRecords:
          preexistingMedicalRecords.trim() || undefined,
        companyPlanId: companyPlanId || undefined,
        enrollmentStatus,
        isNotified,
        isActive,
      };

      const url = `/admin/staffs/${id}`;
      const method = "PUT";

      await apiClient(url, {
        method,
        body: payload,
        onLoading: (l: boolean) => setLoading(l),
      });

      updateStaff(id, {
        firstName,
        middleName: middleName || null,
        lastName,
        email,
        phoneNumber,
        staffId,
        companyId,
        subsidiaryId: subsidiaryId || null,
        dateOfBirth: dateOfBirth || null,
        maxDependents: maxDependents ? parseInt(maxDependents) : null,
        preexistingMedicalRecords: preexistingMedicalRecords || null,
        companyPlanId: companyPlanId || null,
        enrollmentStatus,
        isNotified,
        isActive,
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

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
  };

  const handleErrorClose = () => {
    errorModal.closeModal();
    closeModal();
  };

  const handleResendNotification = async () => {
    try {
      setResendingNotification(true);
      await apiClient(`/admin/staffs/${id}/resend-enrollment-notification`, {
        method: "POST",
      });

      notificationModal.openModal();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to resend enrollment notification."
      );
      errorModal.openModal();
    } finally {
      setResendingNotification(false);
    }
  };

  const handleNotificationClose = () => {
    notificationModal.closeModal();
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
            Edit Staff Member
          </h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
            Update the staff member details.
          </p>
        </div>

        <form className="flex flex-col">
          <div className="custom-scrollbar h-[450px] sm:h-[550px] overflow-y-auto px-2">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
              <div>
                <Label>First Name</Label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setFirstName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Middle Name</Label>
                <Input
                  type="text"
                  value={middleName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMiddleName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Last Name</Label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setLastName(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Staff ID</Label>
                <Input
                  type="text"
                  value={staffId}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStaffId(e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <PhoneInput
                  selectPosition="start"
                  countries={countries}
                  placeholder="+1 (555) 000-0000"
                  //defaultValue={phoneNumber}
                  onChange={handlePhoneChange}
                />
              </div>

              <div>
                <Label>Company</Label>
                <Select
                  options={companies.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select company"
                  onChange={(value) => setCompanyId(value as string)}
                  defaultValue={companyId}
                />
              </div>

              <div>
                <Label>Subsidiary</Label>
                <Select
                  options={subsidiaries.map((s) => ({
                    value: s.id,
                    label: s.name,
                  }))}
                  placeholder="Select subsidiary"
                  onChange={(value) => setSubsidiaryId(value as string)}
                  defaultValue={subsidiaryId}
                  //   disabled={!companyId}
                />
              </div>

              <div>
                <Label>Company Plan</Label>
                <Select
                  options={companyPlans.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  placeholder="Select company plan"
                  onChange={(value) => setCompanyPlanId(value as string)}
                  defaultValue={companyPlanId}
                  //   disabled={!companyId}
                />
              </div>

              <div>
                <DatePicker
                  id="dob-edit"
                  label="Date of Birth"
                  placeholder="Select date of birth"
                  defaultDate={dateOfBirth}
                  onChange={(selectedDates) => {
                    if (selectedDates && selectedDates.length > 0) {
                      const date = selectedDates[0];
                      const formattedDate = date.toISOString().split("T")[0];
                      setDateOfBirth(formattedDate);
                    }
                  }}
                />
              </div>

              <div>
                <Label>Max Dependents</Label>
                <Input
                  type="number"
                  value={maxDependents}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setMaxDependents(e.target.value)
                  }
                  min="0"
                />
              </div>

              <div className="col-span-2">
                <Label>Preexisting Medical Records</Label>
                <TextArea
                  placeholder="Enter any relevant medical history or conditions..."
                  rows={4}
                  value={preexistingMedicalRecords}
                  onChange={(value) => setPreexistingMedicalRecords(value)}
                />
              </div>

              <div>
                <Label>Enrollment Status</Label>
                <Select
                  options={[
                    { value: "enrolled", label: "Enrolled" },
                    { value: "not_enrolled", label: "Not Enrolled" },
                  ]}
                  placeholder="Select status"
                  onChange={(value) =>
                    setEnrollmentStatus(value as "enrolled" | "not_enrolled")
                  }
                  defaultValue={enrollmentStatus}
                />
              </div>

              <div className="flex items-end">
                <Checkbox
                  label="Is Notified"
                  checked={isNotified}
                  onChange={(checked) => setIsNotified(checked)}
                />
              </div>

              <div className="flex items-end">
                <Checkbox
                  label="Is Active"
                  checked={isActive}
                  onChange={(checked) => setIsActive(checked)}
                />
              </div>

              <div className="col-span-2 flex items-center justify-between gap-3 mt-4">
                <button
                  onClick={handleResendNotification}
                  type="button"
                  disabled={resendingNotification}
                  className="flex justify-center rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  {resendingNotification
                    ? "Sending..."
                    : "📧 Resend Enrollment Notification"}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={closeModal}
                    type="button"
                    className="flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={loading}
                    onClick={handlesubmit}
                    type="button"
                    className="flex justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
                  >
                    Update Staff
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal>
      <SuccessModal
        successModal={successModal}
        handleSuccessClose={handleSuccessClose}
      />

      <SuccessModal
        successModal={notificationModal}
        handleSuccessClose={handleNotificationClose}
      />

      <ErrorModal
        message={errorMessage}
        errorModal={errorModal}
        handleErrorClose={handleErrorClose}
      />
    </>
  );
}
