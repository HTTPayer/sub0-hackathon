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
    default: "Spuro Docs – powered by HTTPayer",
    template: "%s | Spuro Docs",
  },
  description:
    "Spuro is an Arkiv-backed, x402-protected backend, documented as an agent-friendly API and SDK catalogue — powered by HTTPayer.",
  keywords: [
    "Spuro",
    "Arkiv",
    "HTTPayer",
    "x402",
    "agent infrastructure",
    "paid storage",
  ],
  authors: [
    {
      name: "HTTPayer",
      url: "https://HTTPayer.example",
    },
  ],
  creator: "HTTPayer",
  openGraph: {
    title: "Spuro Docs – powered by HTTPayer",
    description:
      "Documentation and SDK catalogue for Spuro, an Arkiv-backed, x402-protected backend for agent-friendly paid storage.",
    url: "https://spuro.example", // replace with your real site URL
    siteName: "Spuro Docs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Spuro Docs – powered by HTTPayer",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Spuro Docs – powered by HTTPayer",
    description:
      "Docs and examples for Spuro, an Arkiv-backed, x402-protected backend consumed by AI agents like AI-Spuro.",
    images: ["/og-image.png"],
    creator: "@HTTPayer",
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
export const metadataBase = new URL("https://spuro.example");

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
                <div>© {year} Spuro — powered by HTTPayer.</div>
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
