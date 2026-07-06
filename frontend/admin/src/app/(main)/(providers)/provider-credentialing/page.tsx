import SpinnerThree from "@/components/ui/spinner/SpinnerThree";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AltuHealth Admin",
  description: "",
};

export default function Crm() {
  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6">
      <div className="col-span-12 xl:col-span-8">
        <SpinnerThree />
      </div>

      {/* <div className="col-span-12">
        <CrmRecentOrderTable />
      </div> */}
    </div>
  );
}
