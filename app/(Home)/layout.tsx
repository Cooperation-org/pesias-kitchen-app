// src/app/layout.tsx
import type { Metadata } from "next";

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

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {children}
    </div>
  );
}

