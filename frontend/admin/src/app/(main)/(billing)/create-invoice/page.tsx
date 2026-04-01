"use client";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import InvoicePreviewModal from "@/components/ecommerce/invoices/InvoicePreviewModal";
import DatePicker from "@/components/form/date-picker";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import CreateInvoiceTable from "@/components/invoice/CreateInvoiceTable";
import ErrorModal from "@/components/modals/error";
import SuccessModal from "@/components/modals/success";
import Button from "@/components/ui/button/Button";
import { createInvoice } from "@/lib/apis/invoice";
import { getCurrencyOptions } from "@/lib/currencies";
import { useInvoiceStore } from "@/lib/store/invoiceStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Product {
  name: string;
  price: number;
  quantity: number;
  discount: number;
  total: string;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const addInvoice = useInvoiceStore((s) => s.addInvoice);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [issuedDate, setIssuedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  const handleProductsChange = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
  };

  const subtotal = products.reduce(
    (sum, product) => sum + Number(product.total),
    0
  );
  const vat = subtotal * 0.1;
  const total = subtotal + vat;

  const handleSaveInvoice = async () => {
    // Invoice number is optional - backend will auto-generate if not provided
    if (!customerName || !customerAddress || products.length === 0) {
      setErrorModal({
        isOpen: true,
        message:
          "Please fill in all required fields and add at least one product",
      });
      return;
    }

    try {
      setLoading(true);

      // Transform products into line items format expected by the backend
      const lineItems = products.map((product) => ({
        description: product.name,
        quantity: product.quantity,
        unitPrice: product.price,
        discount: product.discount,
        subtotal: product.price * product.quantity,
        discountAmount:
          (product.price * product.quantity * product.discount) / 100,
        taxAmount: Number(product.total) * 0.1,
      }));

      // Create invoice data without providerId (optional)
      const invoiceData = {
        ...(invoiceNumber && { invoiceNumber }),
        customerName,
        customerAddress,
        invoiceDate: issuedDate,
        dueDate,
        currency,
        lineItems,
      };

      const result = await createInvoice(invoiceData);

      // Add the created invoice to store
      if (result?.data?.invoice) {
        const newInvoice = result.data.invoice;
        addInvoice({
          id: newInvoice.id || "",
          providerId: newInvoice.providerId || "",
          customerName: newInvoice.customerName || "",
          totalAmount: newInvoice.totalAmount || 0,
          paidAmount: newInvoice.paidAmount || 0,
          balanceAmount: newInvoice.balanceAmount || 0,
          invoiceDate: newInvoice.invoiceDate || new Date().toISOString(),
          status:
            (newInvoice.status as
              | "issued"
              | "overdue"
              | "cancelled"
              | "paid"
              | "partially_paid") || "issued",
          paymentStatus:
            (newInvoice.paymentStatus as
              | "unpaid"
              | "paid"
              | "partially_paid") || "unpaid",
          subtotal: newInvoice.subtotal || 0,
          discountAmount: newInvoice.discountAmount || 0,
          taxAmount: newInvoice.taxAmount || 0,
        });
      }

      setSuccessModal({ isOpen: true });

      // Reset form
      setTimeout(() => {
        setInvoiceNumber("");
        setCustomerName("");
        setCustomerAddress("");
        setProducts([]);
        setIssuedDate(new Date().toISOString().split("T")[0]);
        setDueDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        );
      }, 1500);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      setErrorModal({
        isOpen: true,
        message: err.message || "Failed to save invoice. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageBreadcrumb pageTitle="Create Invoice" />
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 className="text-xl font-medium text-gray-800 dark:text-white">
            Create Invoice
          </h2>
        </div>
        <div className="border-b border-gray-200 p-4 sm:p-8 dark:border-gray-800">
          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <Label>Invoice Number</Label>
                <Input
                  placeholder="WP-3434434"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                <Label>Customer Name</Label>
                <Input
                  placeholder=" LTD."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="col-span-full">
                <Label>Customer Address</Label>
                <Input
                  placeholder="Enter customer address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                />
              </div>
              <div>
                <Label>Currency</Label>
                <Select
                  options={getCurrencyOptions()}
                  placeholder="Select currency"
                  onChange={(val) => setCurrency(val)}
                  defaultValue={currency}
                />
              </div>
              <div>
                <DatePicker
                  id="issued-date"
                  label="Issue Date"
                  placeholder="Select issue date"
                  defaultDate={issuedDate}
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = new Date(selectedDates[0]);
                      setIssuedDate(date.toISOString().split("T")[0]);
                    }
                  }}
                />
              </div>
              <div>
                <DatePicker
                  id="due-date"
                  label="Due Date"
                  placeholder="Select due date"
                  defaultDate={dueDate}
                  onChange={(selectedDates) => {
                    if (selectedDates.length > 0) {
                      const date = new Date(selectedDates[0]);
                      setDueDate(date.toISOString().split("T")[0]);
                    }
                  }}
                />
              </div>
            </div>
          </form>
        </div>
        <div className="border-b border-gray-200 p-4 sm:p-8 dark:border-gray-800">
          <CreateInvoiceTable
            onProductsChange={handleProductsChange}
            currency={currency}
          />
        </div>
        <div className="p-4 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <InvoicePreviewModal
              invoiceNumber={invoiceNumber || "#000000"}
              customerName={customerName || "Customer"}
              customerAddress={customerAddress || "Address"}
              products={products}
              subtotal={subtotal}
              vat={vat}
              total={total}
              currency={currency}
              issuedDate={issuedDate}
              dueDate={dueDate}
            />
            <Button
              variant="primary"
              onClick={handleSaveInvoice}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M13.333 16.6666V12.9166C13.333 12.2262 12.7734 11.6666 12.083 11.6666L7.91634 11.6666C7.22599 11.6666 6.66634 12.2262 6.66634 12.9166L6.66635 16.6666M9.99967 5.83325H6.66634M15.4163 16.6666H4.58301C3.89265 16.6666 3.33301 16.1069 3.33301 15.4166V4.58325C3.33301 3.8929 3.89265 3.33325 4.58301 3.33325H12.8171C13.1483 3.33325 13.4659 3.46468 13.7003 3.69869L16.2995 6.29384C16.5343 6.52832 16.6662 6.84655 16.6662 7.17841L16.6663 15.4166C16.6663 16.1069 16.1066 16.6666 15.4163 16.6666Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {loading ? "Saving..." : "Save Invoice"}
            </Button>
          </div>
        </div>
      </div>

      <SuccessModal
        successModal={successModal}
        handleSuccessClose={() => {
          setSuccessModal({ isOpen: false });
          router.push("/invoices");
        }}
      />

      <ErrorModal
        errorModal={errorModal}
        handleErrorClose={() => setErrorModal({ isOpen: false, message: "" })}
        message={errorModal.message}
      />
    </div>
  );
}
