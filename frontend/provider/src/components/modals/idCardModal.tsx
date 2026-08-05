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
    pictureUrl?: string | null;
    plan?: string;
  };
}

function PassportPlaceholder() {
  return (
    <svg
      aria-hidden="true"
      className="h-full w-full"
      viewBox="0 0 180 220"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle cx="90" cy="77" r="42" fill="#aac9e5" />
      <path d="M25 220c4-52 27-82 65-82s61 30 65 82H25Z" fill="#aac9e5" />
      <path
        d="M51 72c0-30 16-50 39-50s39 20 39 50v23c0 29-17 52-39 52S51 124 51 95V72Z"
        fill="#aac9e5"
      />
    </svg>
  );
}

export default function IdCardModal({
  isOpen,
  onClose,
  idCardData,
}: IdCardModalProps) {
  const fullName =
    [idCardData.firstName, idCardData.lastName].filter(Boolean).join(" ") ||
    "Not available";
  const policyNumber = idCardData.policyNumber || "N/A";
  const sex = idCardData.gender?.trim().charAt(0).toUpperCase() || "N/A";
  const plan = idCardData.plan?.trim() || "AltuHealth Plan";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-[780px] p-3 sm:p-6 lg:p-8"
    >
      <div className="pt-7 sm:pt-9">
        <div
          aria-label={`AltuHealth ID card for ${fullName}`}
          className="relative aspect-[1.56/1] w-full overflow-hidden rounded-[clamp(1rem,3vw,2rem)] border-[clamp(1px,0.35vw,3px)] border-[#d7e5f3] bg-[#fdfefe] font-sans shadow-[0_12px_28px_rgba(69,111,154,0.18)]"
        >
          <svg
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[8%] h-[42%] w-full"
            preserveAspectRatio="none"
            viewBox="0 0 1000 300"
          >
            <path
              d="M0 80c150 45 237 164 420 152 173-11 294-128 580-160v228H0V80Z"
              fill="#eaf3ff"
            />
            <path
              d="M0 170c168 52 303 101 474 87 194-16 327-117 526-151v194H0V170Z"
              fill="#dcecff"
            />
            <path
              d="M0 226c197 45 338 66 510 50 189-18 321-72 490-103v127H0V226Z"
              fill="#cfe3fb"
            />
          </svg>

          <div className="absolute inset-x-[7%] top-[7%] z-10 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-[clamp(0.4rem,1.6vw,1rem)]">
              <Image
                src="/images/main/small.svg"
                alt=""
                width={104}
                height={90}
                className="h-[clamp(2.6rem,9vw,6.2rem)] w-[clamp(2.9rem,10vw,7rem)] object-contain"
                priority
              />
              <span className="truncate text-[clamp(1.25rem,5vw,3.2rem)] font-semibold tracking-[-0.03em] text-[#29313d]">
                AltuHealth
              </span>
            </div>

            <div className="min-w-[30%] overflow-hidden rounded-[clamp(0.65rem,2vw,1.25rem)] border-2 border-[#66a3ed] bg-white text-center shadow-sm">
              <div className="bg-[#68a4ec] px-2 py-[clamp(0.18rem,0.8vw,0.45rem)] text-[clamp(0.58rem,2vw,1.12rem)] font-medium tracking-wide text-white">
                Policy Number
              </div>
              <div
                className="truncate px-2 py-[clamp(0.25rem,1.1vw,0.7rem)] text-[clamp(0.7rem,2.6vw,1.55rem)] font-semibold tracking-[0.04em] text-[#29313d]"
                title={policyNumber}
              >
                {policyNumber}
              </div>
            </div>
          </div>

          <div className="absolute inset-x-[5%] top-[35%] bottom-[10%] z-20 flex items-stretch gap-[clamp(0.7rem,3vw,2.2rem)]">
            <div className="relative w-[29%] shrink-0 overflow-hidden rounded-[clamp(0.65rem,2vw,1.25rem)] border-[clamp(2px,0.5vw,4px)] border-[#9dc5e7] bg-[#eaf3fb] shadow-sm">
              <span className="absolute inset-x-0 top-[5%] z-10 text-center text-[clamp(0.55rem,2vw,1.2rem)] font-semibold text-[#b1cde6]">
                PASSPORT
              </span>
              <div className="absolute inset-x-[3%] bottom-0 top-[18%]">
                {idCardData.pictureUrl ? (
                  <Image
                    src={idCardData.pictureUrl}
                    alt={fullName}
                    fill
                    sizes="(max-width: 780px) 28vw, 190px"
                    className="object-cover object-top"
                  />
                ) : (
                  <PassportPlaceholder />
                )}
              </div>
            </div>

            <dl className="flex min-w-0 flex-1 flex-col justify-center gap-[clamp(0.3rem,1.8vw,1rem)] pb-[8%]">
              <div className="flex min-w-0 items-baseline border-b border-[#cbd8e4] pb-[clamp(0.12rem,0.6vw,0.35rem)]">
                <dt className="mr-2 shrink-0 text-[clamp(0.72rem,2.8vw,1.65rem)] font-semibold text-[#5d9eea]">
                  Name:
                </dt>
                <dd
                  className="truncate text-[clamp(0.72rem,2.7vw,1.55rem)] font-medium text-[#29313d]"
                  title={fullName}
                >
                  {fullName}
                </dd>
              </div>
              <div className="flex items-baseline border-b border-[#cbd8e4] pb-[clamp(0.12rem,0.6vw,0.35rem)]">
                <dt className="mr-2 text-[clamp(0.72rem,2.8vw,1.65rem)] font-semibold text-[#5d9eea]">
                  Sex:
                </dt>
                <dd className="text-[clamp(0.72rem,2.7vw,1.55rem)] font-medium text-[#29313d]">
                  {sex}
                </dd>
              </div>
              <div className="flex min-w-0 items-baseline border-b border-[#cbd8e4] pb-[clamp(0.12rem,0.6vw,0.35rem)]">
                <dt className="mr-2 shrink-0 text-[clamp(0.72rem,2.8vw,1.65rem)] font-semibold text-[#5d9eea]">
                  Plan:
                </dt>
                <dd
                  className="truncate text-[clamp(0.68rem,2.55vw,1.48rem)] font-medium text-[#29313d]"
                  title={plan}
                >
                  {plan}
                </dd>
              </div>
            </dl>
          </div>

          <div className="absolute inset-x-0 bottom-[8%] z-10 flex h-[10%] items-center justify-center bg-[#68a4ec]">
            <span className="ml-[24%] text-[clamp(0.68rem,2.6vw,1.5rem)] font-medium tracking-wide text-white">
              Enrollee ID Card
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
