import { Metadata } from "next";
import { Inter } from "next/font/google";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome the unofficial Avalanche Apex Connect nickname changer",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}
