import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Beat Generator - Premium Beats Marketplace",
  description: "Discover and download high-quality AI-generated beats. BeatStars-optimized tracks with BPM, Key, and Genre tags.",
  keywords: ["AI beats", "music production", "beat maker", "hip hop beats", "instrumental beats"],
  authors: [{ name: "AI Beat Generator" }],
  openGraph: {
    title: "AI Beat Generator - Premium Beats Marketplace",
    description: "Discover and download high-quality AI-generated beats",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Beat Generator - Premium Beats Marketplace",
    description: "Discover and download high-quality AI-generated beats",
  },
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
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
