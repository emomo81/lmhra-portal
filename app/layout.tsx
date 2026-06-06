import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LMHRA Pharmaceutical Waste Disposal Portal",
  description: "Liberia Medicines & Health Products Regulatory Authority — Pharmaceutical Waste Disposal Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
