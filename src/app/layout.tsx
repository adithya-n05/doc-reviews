import type { Metadata } from "next";
import {
  Newsreader,
  Source_Code_Pro,
  Source_Sans_3,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { FeedbackWidget } from "@/components/feedback-widget";
import { FooterThemeToggle } from "@/components/footer-theme-toggle";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site-metadata";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "DoC Reviews",
    "Imperial Computing",
    "module reviews",
    "student feedback",
    "course ratings",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  icons: {
    icon: [
      {
        url: "/favicon-dr.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        url: "/favicon.ico",
      },
      {
        url: "/favicon-dr-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-dr-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    shortcut: ["/favicon.ico"],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${newsreader.variable} ${sourceSans.variable} ${sourceCode.variable}`}>
        <FeedbackWidget />
        {children}
        <footer className="theme-toggle-footer">
          <FooterThemeToggle />
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
