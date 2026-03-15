import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CrowdMind AI — Collective Intelligence Platform",
  description:
    "Ask the world. Get AI-powered insights. Make better decisions with collective intelligence.",
  keywords: [
    "crowdmind",
    "AI",
    "collective intelligence",
    "predictions",
    "voting",
    "decisions",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        <Sidebar />
        <main
          style={{
            marginTop: 70,
            marginLeft: 240,
            minHeight: 'calc(100vh - 70px)',
            padding: '24px 28px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
