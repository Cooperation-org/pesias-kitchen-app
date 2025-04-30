import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { AppProvider } from "@/providers/web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Global Classrooms",
  description: "Cross-community education for sustainable development",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
