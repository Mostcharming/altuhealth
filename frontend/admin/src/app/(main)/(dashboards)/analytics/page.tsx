/* eslint-disable @next/next/no-img-element */
import GridShape from "@/components/common/GridShape";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin",
  description: "",
};

export default function Maintenance() {
  return (
    <>
      <div className="relative flex flex-col items-center justify-center min-h-screen p-6 overflow-hidden z-1">
        <GridShape />

        <div>
          <div className="mx-auto w-full max-w-[274px] text-center sm:max-w-[555px]">
            <div className="mx-auto mb-10 w-full max-w-[155px] text-center sm:max-w-[204px]">
              <img
                src="/images/error/maintenance.svg"
                alt="maintenance"
                className="dark:hidden"
              />
              <img
                src="/images/error/maintenance-dark.svg"
                alt="maintenance"
                className="hidden dark:block"
              />
            </div>

            <h1 className="mb-2 font-bold text-gray-800 text-title-md dark:text-white/90 xl:text-title-2xl">
              MAINTENANCE
            </h1>

            <p className="mt-6 mb-6 text-base text-gray-700 dark:text-gray-400 sm:text-lg">
              This page is Currently under maintenance We will be back Shortly
              Thank You For Patience
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
