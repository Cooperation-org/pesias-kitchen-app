// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Header from "@/components/Header";

import { AppProvider } from '@/providers/web3Provider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pesia's Kitchen EAT Initiative",
  description: "Food rescue operations with GoodDollar rewards",
  keywords: ["Food rescue", "GoodDollar", "EAT Initiative", "Volunteer", "G$"],
  authors: [{ name: "Pesia's Kitchen" }],
  openGraph: {
    title: "Pesia's Kitchen EAT Initiative",
    description: "Food rescue operations with GoodDollar rewards",
    url: "https://www.pesiaskitchen.org",
    siteName: "Pesia's Kitchen EAT Initiative",
    images: [
      {
        url: "/og-image.jpg", // You'll need to add this image to your public folder
        width: 1200,
        height: 630,
        alt: "Pesia's Kitchen EAT Initiative",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pesia's Kitchen EAT Initiative",
    description: "Food rescue operations with GoodDollar rewards",
    images: ["/twitter-image.jpg"], // You'll need to add this image to your public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans h-full`}
      >

        <AppProvider >
        {children}
        </AppProvider>


      </body>
    </html>
  );
}

