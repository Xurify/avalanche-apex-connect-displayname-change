import { Metadata } from "next";
import { Inter } from "next/font/google";

import Provider from "@/components/Provider";
import { Header } from "@/components/Header";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome the unofficial Avalanche Apex Connect nickname changer",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`min-h-screen bg-[#edede9] text-[#9c9186] dark:bg-card dark:text-primary ${inter.className}`}>
        <Provider>
          <Header />
          {children}
        </Provider>
      </body>
    </html>
  );
}
