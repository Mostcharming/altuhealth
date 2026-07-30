"use client";

import { apiClient } from "@/lib/apiClient";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";

type CorporateRequestFormData = {
  companyName: string;
  contactName: string;
  email: string;
  phoneNumber: string;
  employeeCount: string;
  message: string;
};

const emptyForm: CorporateRequestFormData = {
  companyName: "",
  contactName: "",
  email: "",
  phoneNumber: "",
  employeeCount: "",
  message: "",
};

export default function CorporateRequestForm() {
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setIsSubmitting(true);
      await apiClient("/public/corporate-requests", {
        method: "POST",
        body: {
          ...form,
          employeeCount: form.employeeCount
            ? Number(form.employeeCount)
            : undefined,
        },
      });
      setForm(emptyForm);
      setSuccess(
        "Your request has been submitted. Our team will contact you shortly.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit your request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="corporate-request">
      <div className="corporate-request-copy">
        <span>Corporate Coverage</span>
        <h3>Health coverage built around your team.</h3>
        <p>
          Share your organisation&apos;s details and our corporate care team
          will reach out to discuss the right plan for your workforce.
        </p>
      </div>

      <form className="corporate-request-form" onSubmit={handleSubmit}>
        <label>
          Company name
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            maxLength={150}
            required
          />
        </label>
        <label>
          Contact person
          <input
            type="text"
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
            maxLength={120}
            required
          />
        </label>
        <label>
          Work email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            maxLength={254}
            required
          />
        </label>
        <label>
          Phone number
          <input
            type="tel"
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            maxLength={30}
            required
          />
        </label>
        <label className="corporate-request-full">
          Number of employees <span>(optional)</span>
          <input
            type="number"
            name="employeeCount"
            value={form.employeeCount}
            onChange={handleChange}
            min={1}
            max={1000000}
          />
        </label>
        <label className="corporate-request-full">
          Anything else we should know? <span>(optional)</span>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            maxLength={2000}
          />
        </label>

        {error && (
          <div className="corporate-request-message error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="corporate-request-message success" role="status">
            {success}
          </div>
        )}

        <button className="buy-btn" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit request"}
          <span aria-hidden="true">→</span>
        </button>
      </form>
    </div>
  );
}
