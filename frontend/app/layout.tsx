import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import { TabProvider } from "../components/TabProvider";
import HackathonBanner from "../components/HackathonBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Spuro - AI Agents Marketplace",
    template: "%s | Spuro",
  },
  description:
    "AI agents now can buy their own infrastructure! Marketplace and catalog of autonomous agents — built by HTTPayer.",
  keywords: [
    "AI agents",
    "marketplace",
    "autonomous agents",
    "agent infrastructure",
    "hackathon",
  ],
  authors: [
    {
      name: "HTTPayer",
      url: "https://httpayer.example",
    },
  ],
  creator: "HTTPayer",
  openGraph: {
    title: "Spuro — AI Agents Marketplace",
    description:
      "Discover, buy, and run autonomous AI agents that provision their own infrastructure.",
    url: "https://Spuro.example", // replace with your real site URL
    siteName: "Spuro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spuro — AI Agents Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spuro — AI Agents Marketplace",
    description:
      "Discover autonomous AI agents that can provision and manage their own infrastructure.",
    images: ["/og-image.png"],
    creator: "@httpayer",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  // themeColor moved out of metadata per Next.js recommendations
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
};

// Set metadataBase so Next can resolve social images/OG/twitter assets correctly
export const metadataBase = new URL("https://arkivenue.example");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const year = new Date().getFullYear();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100`}
      >
        {/* Skip link for keyboard users */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:bg-white focus:dark:bg-slate-800 focus:px-3 focus:py-2 focus:rounded-md"
        >
          Skip to content
        </a>

        <TabProvider>
          <div className="min-h-screen flex flex-col">
            <header className="z-40">
              <Header />
              
            </header>

            <main id="content" role="main" className="flex-1 w-full">
              {children}
            </main>

            <footer className="w-full border-t border-slate-200 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400">
              <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
                <div>
                  © {year} Spuro — Built by HTTPayer. All rights reserved.
                </div>
                <div>
                  <a href="/terms" className="underline offset-2">
                    Terms
                  </a>
                  <span className="mx-2">·</span>
                  <a href="/privacy" className="underline offset-2">
                    Privacy
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </TabProvider>
      </body>
    </html>
  );
}
