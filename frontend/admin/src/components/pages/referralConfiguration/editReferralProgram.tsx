"use client";

import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { referralProgramAPI } from "@/lib/apis/referral";
import { ChangeEvent, useEffect, useState } from "react";

interface ReferralProgram {
  id: string;
  name: string;
  description?: string;
  status: "active" | "inactive" | "paused";
  rewardType: "fixed" | "percentage";
  fixedRate?: number;
  percentageRate?: number;
  capAmount?: number;
  minimumPayout: number;
  startDate: string;
  endDate?: string;
  maxReferralsPerReferrer?: number;
  maxTotalPayout?: number;
  picture?: string;
  createdAt: string;
}

interface EditReferralProgramProps {
  isOpen: boolean;
  closeModal: () => void;
  program?: ReferralProgram | null;
  onSuccess: () => void;
  errorModal: ReturnType<typeof useModal>;
  successModal: ReturnType<typeof useModal>;
}

export default function EditReferralProgram({
  isOpen,
  closeModal,
  program,
  onSuccess,
  errorModal,
  successModal,
}: EditReferralProgramProps) {
  const [loading, setLoading] = useState(false);

  const [id, setId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive" | "paused">(
    "active"
  );
  const [rewardType, setRewardType] = useState<"fixed" | "percentage">("fixed");
  const [fixedRate, setFixedRate] = useState<string>("");
  const [percentageRate, setPercentageRate] = useState<string>("");
  const [capAmount, setCapAmount] = useState<string>("");
  const [minimumPayout, setMinimumPayout] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [maxReferralsPerReferrer, setMaxReferralsPerReferrer] =
    useState<string>("");
  const [maxTotalPayout, setMaxTotalPayout] = useState<string>("");
  const [picture, setPicture] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState(
    "Failed to update program. Please try again."
  );

  const handleErrorClose = () => {
    errorModal.closeModal();
  };

  const handleSuccessClose = () => {
    successModal.closeModal();
    closeModal();
    onSuccess();
  };

  // When the modal opens with a program, populate the form with its data.
  useEffect(() => {
    if (isOpen && program) {
      setId(program.id ?? "");
      setName(program.name ?? "");
      setDescription(program.description ?? "");
      setStatus(program.status ?? "active");
      setRewardType(program.rewardType ?? "fixed");
      setFixedRate(program.fixedRate?.toString() ?? "");
      setPercentageRate(program.percentageRate?.toString() ?? "");
      setCapAmount(program.capAmount?.toString() ?? "");
      setMinimumPayout(program.minimumPayout?.toString() ?? "");
      setStartDate(program.startDate ? program.startDate.split("T")[0] : "");
      setEndDate(program.endDate ? program.endDate.split("T")[0] : "");
      setMaxReferralsPerReferrer(
        program.maxReferralsPerReferrer?.toString() ?? ""
      );
      setMaxTotalPayout(program.maxTotalPayout?.toString() ?? "");
      setPicture(program.picture ?? "");
    }

    if (!isOpen) {
      setId("");
      setName("");
      setDescription("");
      setStatus("active");
      setRewardType("fixed");
      setFixedRate("");
      setPercentageRate("");
      setCapAmount("");
      setMinimumPayout("");
      setStartDate("");
      setEndDate("");
      setMaxReferralsPerReferrer("");
      setMaxTotalPayout("");
      setPicture("");
    }
  }, [isOpen, program]);

  const handleSubmit = async () => {
    try {
      if (!name.trim()) {
        setErrorMessage("Program name is required.");
        errorModal.openModal();
        return;
      }

      if (!startDate) {
        setErrorMessage("Start date is required.");
        errorModal.openModal();
        return;
      }

      if (rewardType === "fixed" && !fixedRate) {
        setErrorMessage("Fixed rate is required for fixed reward type.");
        errorModal.openModal();
        return;
      }

      if (rewardType === "percentage" && !percentageRate) {
        setErrorMessage(
          "Percentage rate is required for percentage reward type."
        );
        errorModal.openModal();
        return;
      }

      setLoading(true);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        status,
        rewardType,
        fixedRate: fixedRate ? parseFloat(fixedRate) : null,
        percentageRate: percentageRate ? parseFloat(percentageRate) : null,
        capAmount: capAmount ? parseFloat(capAmount) : null,
        minimumPayout: minimumPayout ? parseFloat(minimumPayout) : 0,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        maxReferralsPerReferrer: maxReferralsPerReferrer
          ? parseInt(maxReferralsPerReferrer)
          : null,
        maxTotalPayout: maxTotalPayout ? parseFloat(maxTotalPayout) : null,
        picture,
      };

      const data = await referralProgramAPI.updateProgram(id, payload);

      if (data.success) {
        successModal.openModal();
      } else {
        setErrorMessage(data.message || "Failed to update referral program");
        errorModal.openModal();
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

  return (
    <>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Referral Program
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update the referral program details below.
            </p>
          </div>

          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Program Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Program Name</Label>
                    <Input
                      type="text"
                      value={name}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setName(e.target.value)
                      }
                      placeholder="Program name"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Status</Label>
                    <Select
                      options={[
                        { value: "active", label: "Active" },
                        { value: "inactive", label: "Inactive" },
                        { value: "paused", label: "Paused" },
                      ]}
                      placeholder="Select Status"
                      onChange={(value) =>
                        setStatus(value as "active" | "inactive" | "paused")
                      }
                      defaultValue={status}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Description</Label>
                    <TextArea
                      rows={3}
                      value={description}
                      onChange={(value) => setDescription(value)}
                      placeholder="Description"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Reward Type</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="rewardType"
                          value="fixed"
                          checked={rewardType === "fixed"}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setRewardType(
                              e.target.value as "fixed" | "percentage"
                            )
                          }
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
                          checked={rewardType === "percentage"}
                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                            setRewardType(
                              e.target.value as "fixed" | "percentage"
                            )
                          }
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Percentage
                        </span>
                      </label>
                    </div>
                  </div>

                  {rewardType === "fixed" ? (
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Fixed Rate (₦)</Label>
                      <Input
                        type="number"
                        value={fixedRate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setFixedRate(e.target.value)
                        }
                        placeholder="e.g., 500"
                      />
                    </div>
                  ) : (
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Percentage Rate (%)</Label>
                      <Input
                        type="number"
                        value={percentageRate}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setPercentageRate(e.target.value)
                        }
                      />
                    </div>
                  )}

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Cap Amount (₦)</Label>
                    <Input
                      type="number"
                      value={capAmount}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setCapAmount(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Minimum Payout (₦)</Label>
                    <Input
                      type="number"
                      value={minimumPayout}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setMinimumPayout(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setStartDate(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setEndDate(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Max Referrals Per Referrer</Label>
                    <Input
                      type="number"
                      value={maxReferralsPerReferrer}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setMaxReferralsPerReferrer(e.target.value)
                      }
                      placeholder="Max referrals"
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Max Total Payout (₦)</Label>
                    <Input
                      type="number"
                      value={maxTotalPayout}
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        setMaxTotalPayout(e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>{" "}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancel
              </Button>
              <Button loading={loading} size="sm" onClick={handleSubmit}>
                Update Program
              </Button>
            </div>
          </form>
        </div>
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
