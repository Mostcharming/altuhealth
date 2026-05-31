import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AltuHealth | Technology-Driven Healthcare Coverage",
  description:
    "Affordable, reliable, and technology-powered healthcare coverage solutions for individuals, families, SMEs, and enterprises across Nigeria.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
