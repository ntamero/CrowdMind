import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/lib/supabase/auth-context";
import { WalletProvider } from "@/context/WalletContext";
import Footer from "@/components/layout/Footer";
import VisitorTracker from "@/components/shared/VisitorTracker";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wisery — Ask. Vote. Earn.",
  description:
    "Topluluk zekası platformu. Soru sor, oyla, tahmin yap, token kazan. AI destekli analizlerle daha iyi kararlar ver.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider>
            <WalletProvider>
              <Navbar />
              <Sidebar />
              <main className="mt-14 ml-0 lg:ml-[240px] min-h-[calc(100vh-56px)] px-3 py-4 lg:px-5 lg:py-5 relative z-[1]">
                {children}
              </main>
              <div className="ml-0 lg:ml-[240px]">
                <Footer />
              </div>
              <VisitorTracker />
            </WalletProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
