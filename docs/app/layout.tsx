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
    default: "Arkivendor – powered by httpayer",
    template: "%s | Arkivendor",
  },
  description:
    "Arkivendor is an Arkiv + x402 backend, documented as an agent-friendly API and SDK catalogue — powered by httpayer.",
  keywords: [
    "Arkivendor",
    "Arkiv",
    "httpayer",
    "x402",
    "agent infrastructure",
    "paid storage",
  ],
  authors: [
    {
      name: "httpayer",
      url: "https://httpayer.example",
    },
  ],
  creator: "httpayer",
  openGraph: {
    title: "Arkivendor – powered by httpayer",
    description:
      "Documentation and SDK catalogue for Arkivendor, an Arkiv + x402 backend for agent-friendly paid storage.",
    url: "https://arkivendor.example", // replace with your real site URL
    siteName: "Arkivendor",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Arkivendor – powered by httpayer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arkivendor – powered by httpayer",
    description:
      "Docs and examples for Arkivendor, an Arkiv + x402 backend consumed by AI agents like AI‑rkiv.",
    images: ["/og-image.png"],
    creator: "@httpayer",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
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
export const metadataBase = new URL("https://arkivendor.example");

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
                <div>© {year} Arkivendor — powered by httpayer.</div>
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
