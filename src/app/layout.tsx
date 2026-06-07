import type { Metadata } from "next";
import { Inter, Outfit, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["300","400","500","600","700"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  title: "Ruang Kamu — Understand Your Mind, One Day at a Time",
  description: "A calming mood tracker and journaling space. Track your emotions, discover patterns, and reflect — without judgment.",
  keywords: ["mood tracker", "journaling", "mental health", "self reflection"],
  authors: [{ name: "Muhammad Dinan Ghifari" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} ${poppins.variable} font-sans bg-white text-[#0a0a0a]`}>
        {/* Subtle ambient background — very light, warm */}
        <div className="ambient-bg">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,0,0,0.03) 0%, transparent 70%)" }} />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(0,0,0,0.02) 0%, transparent 70%)" }} />
        </div>
        <main className="relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
