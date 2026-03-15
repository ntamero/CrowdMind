import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/lib/supabase/auth-context";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrowdMind AI — Collective Intelligence Platform",
  description:
    "Ask the world. Get AI-powered insights. Make better decisions with collective intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased`}>
        <AuthProvider>
          <Navbar />
          <Sidebar />
          <main className="mt-14 ml-0 lg:ml-[240px] min-h-[calc(100vh-56px)] p-4 lg:p-6 relative z-[1]">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
