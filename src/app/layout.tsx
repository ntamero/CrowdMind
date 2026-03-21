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

const SITE_URL = "https://wisery.live";
const SITE_NAME = "Wisery";
const SITE_SLOGAN = "Ask. Vote. Earn. — The Crowd Knows.";
const SITE_DESCRIPTION = "The social prediction platform where crowd wisdom meets crypto rewards. Ask questions, vote on outcomes, predict markets, and earn WSR tokens. AI-powered analysis on every poll. Like Polymarket meets Reddit — but you earn for every vote.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — ${SITE_SLOGAN}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "prediction market", "social prediction", "crowd wisdom", "vote to earn",
    "crypto rewards", "WSR token", "poll platform", "community voting",
    "prediction platform", "polymarket alternative", "earn crypto voting",
    "AI analysis", "crowd intelligence", "social polling", "web3 voting",
    "question and answer", "prediction markets crypto", "vote earn tokens",
    "opinion marketplace", "forecasting platform", "wisdom of crowds",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_SLOGAN}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_SLOGAN}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_SLOGAN}`,
    description: SITE_DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@wisery_live",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "MUyYN7UP7Mf4mSo43ZSEYxDD4zmpO9L-E9mxtrJQPf4",
    other: {
      "msvalidate.01": "BA67E49E0116564CE923701EDC94865A",
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a14" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9093377926430179"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "SocialNetworkingApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "1200",
              },
              author: {
                "@type": "Organization",
                name: SITE_NAME,
                url: SITE_URL,
              },
              sameAs: [
                "https://twitter.com/wisery_live",
                "https://t.me/wisery_live",
              ],
            }),
          }}
        />
      </head>
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
