/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Image from "next/image";

export default function EnrolleeDependentPHeader({ data }: { data: any }) {
  return (
    <div className="flex flex-col justify-between gap-6 rounded-2xl border border-gray-200 bg-white px-6 py-5 sm:flex-row sm:items-center dark:border-gray-800 dark:bg-white/3">
      <div className="flex flex-col gap-2.5 divide-gray-300 sm:flex-row sm:divide-x dark:divide-gray-700">
        <div className="flex items-center gap-2 sm:pr-3">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image
              width={80}
              height={80}
              src={data?.pictureUrl || "/images/main/small.svg"}
              alt="dependent"
            />
          </div>
          <span className="text-base font-medium text-gray-700 dark:text-gray-400">
            Name: {data?.firstName} {data?.lastName}
          </span>
        </div>
      </div>
    </div>
  );
}
