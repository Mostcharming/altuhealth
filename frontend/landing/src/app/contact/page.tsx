"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission here (e.g., send to API)
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setSubmitted(false);
    }, 2000);
  };

  return (
    <>
      <Header />
      <section style={{ paddingTop: "180px", minHeight: "100vh" }}>
        <div className="container" style={{ maxWidth: "600px" }}>
          <div className="section-title">
            <h2>Contact Us</h2>
            <p>
              Have questions? We&apos;d love to hear from you. Send us a message
              and we&apos;ll respond as soon as possible.
            </p>
          </div>

          {submitted && (
            <div
              style={{
                background: "#d1fae5",
                color: "#065f46",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "30px",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              ✓ Thank you for your message. We&apos;ll be in touch soon!
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "16px",
                fontFamily: "inherit",
              }}
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "16px",
                fontFamily: "inherit",
              }}
            />

            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "16px",
                fontFamily: "inherit",
              }}
            />

            <textarea
              name="message"
              placeholder="Your Message"
              rows={6}
              value={formData.message}
              onChange={handleChange}
              required
              style={{
                padding: "18px",
                borderRadius: "10px",
                border: "1px solid #ddd",
                fontSize: "16px",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                padding: "18px",
                fontSize: "16px",
                width: "100%",
              }}
            >
              Send Message
            </button>
          </form>

          <div
            style={{
              marginTop: "60px",
              padding: "40px",
              background: "#f8fafc",
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ marginBottom: "30px", color: "#0f172a" }}>
              Get In Touch
            </h3>

            <div style={{ marginBottom: "25px" }}>
              <h4 style={{ color: "#0284c7", marginBottom: "10px" }}>Email</h4>
              <p style={{ color: "#475569" }}>info@altuhealth.com</p>
            </div>

            <div style={{ marginBottom: "25px" }}>
              <h4 style={{ color: "#0284c7", marginBottom: "10px" }}>Phone</h4>
              <p style={{ color: "#475569" }}>+234 906 123 4567</p>
            </div>

            <div>
              <h4 style={{ color: "#0284c7", marginBottom: "10px" }}>
                WhatsApp
              </h4>
              <a
                href="https://wa.me/2348107599978"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#0284c7",
                  textDecoration: "underline",
                  fontWeight: 600,
                }}
              >
                Chat with us on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
