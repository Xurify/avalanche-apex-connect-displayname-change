import React from "react";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

import { MoonIcon, SunIcon } from 'lucide-react';
import { useDarkMode } from "usehooks-ts";

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  const { isDarkMode, toggle, enable, disable } = useDarkMode({ defaultValue: true, initializeWithValue: false });

  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      if (document.body.classList.contains("dark")) {
        document.body.classList.remove("dark");
      }
    }
  }, []);

  return (
    <div
      className={cn(`min-h-screen bg-card text-primary ${inter.className} ${isDarkMode ? "dark" : "light"}`, {
        dark: isDarkMode,
      })}
    >
      <header className="flex items-center justify-between font-bold h-[70px] p-4 border-b border-gray-500">
        <h1 className="">(Unofficial) Avalanche Apex Connect Nickname Changer</h1>
        <div className="flex items-center">
        {isDarkMode ? <MoonIcon className="mr-2" /> : <SunIcon className="mr-2" />}
        <Switch defaultChecked={isDarkMode} onCheckedChange={toggle} />
        </div>
      </header>
      <Component {...pageProps} isDarkMode={isDarkMode} />
    </div>
  );
}
