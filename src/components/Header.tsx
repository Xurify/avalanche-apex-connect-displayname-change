'use client';

import Link from "next/link";
import { useDarkMode } from "usehooks-ts";
import { Switch } from "./ui/switch";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

export const Header = () => {
  const defaultValue = false;
 // const { isDarkMode, toggle } = useDarkMode({ defaultValue, initializeWithValue: false });
  const { systemTheme, theme, setTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const toggle = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const switchClassname =
    "data-[state=checked]:bg-theme data-[state=unchecked]:bg-[#FEE7E9] dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-input";

  return (
    <header className="flex items-center justify-between font-bold h-[70px] p-4 border-b border-[#9c9186] dark:border-gray-500">
      <Link href="/">
        <h1 className="">(Unofficial) Avalanche Apex Connect Nickname Changer</h1>
      </Link>
      <div className="flex items-center">
        {isDarkMode ? <MoonIcon className="mr-2" /> : <SunIcon className="mr-2" />}
        <Switch className={switchClassname} checked={isDarkMode} onCheckedChange={toggle} />
      </div>
    </header>
  );
};
