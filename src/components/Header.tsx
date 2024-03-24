"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import ThemeSwitcher from "./ThemeSwitcher";

export const Header = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <header className="flex items-center justify-between font-bold h-[70px] p-4 border-b border-[#9c9186] dark:border-gray-500">
      <Link href="/">
        <h1 className="">(Unofficial) Avalanche Apex Connect Nickname Changer</h1>
      </Link>
      <ThemeSwitcher />
    </header>
  );
};
