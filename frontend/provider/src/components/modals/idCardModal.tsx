"use client";

import Image from "next/image";
import { Modal } from "../ui/modal";

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  idCardData: {
    policyNumber: string;
    firstName: string;
    lastName: string;
    gender: string;
    pictureUrl?: string;
    plan?: string;
  };
}

export default function IdCardModal({
  isOpen,
  onClose,
  idCardData,
}: IdCardModalProps) {
  console.log("ID Card Data:", idCardData); // Debugging log
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[600px] p-5 lg:p-10"
    >
      <div className="text-center">
        {/* ID Card Display */}
        <div
          className="relative w-full mt-7 p-8 rounded-2xl shadow-2xl"
          style={{
            aspectRatio: "16/10",
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          }}
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300/10 rounded-full -ml-24 -mb-24"></div>

          {/* Top Section with Logo */}
          <div className="relative z-10 flex justify-between items-start ">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-lg p-2 shadow-lg">
                <Image
                  src="/images/main/small.svg"
                  alt="AltuHealth Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <div>
                <h2 className="text-white text-2xl font-bold">AltuHealth</h2>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-3 border border-white/30 shadow-lg">
              <p className="text-white/80 font-semibold text-xs">
                Policy Number
              </p>
              <p className="text-white font-bold text-lg tracking-wide">
                {idCardData.policyNumber}
              </p>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="relative z-10 flex gap-8 items-center h-full">
            {/* Photo Section */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl blur-lg opacity-50"></div>
                <div className="relative w-28 h-36 bg-gradient-to-br from-blue-300 to-blue-500 rounded-xl overflow-hidden border-4 border-white shadow-2xl">
                  <Image
                    src={
                      idCardData.pictureUrl || "/images/main/placeholder.svg"
                    }
                    alt={`${idCardData.firstName} ${idCardData.lastName}`}
                    width={112}
                    height={144}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex-1 text-white space-y-5">
              <div>
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">
                  Full Name
                </p>
                <p className="text-2xl font-bold text-white">
                  {idCardData.firstName} {idCardData.lastName}
                </p>
              </div>

              <div className="flex gap-12">
                <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-3 border border-white/20">
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
                    Sex
                  </p>
                  <p className="text-lg font-bold text-white capitalize">
                    {idCardData.gender?.[0]?.toUpperCase() || "M"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-4 left-8 right-8 flex justify-between items-center z-10 pt-4 border-t border-white/20">
            <p className="text-white/70 text-xs font-medium">
              Enrollee ID Card
            </p>
            <p className="text-white/70 text-xs font-medium">Valid ID</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
