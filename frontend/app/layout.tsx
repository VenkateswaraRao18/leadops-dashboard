import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadOps — Autonomous Lead Intelligence",
  description: "AI-powered lead qualification, routing, and onboarding platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className}>
      <body className="min-h-screen bg-[#0a0b0f]">{children}</body>
    </html>
  );
}
