"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

const ThemeSwitcher = () => {
  const { systemTheme, theme, setTheme } = useTheme();

  const renderThemeChanger = () => {
    const currentTheme = theme === "system" ? systemTheme : theme;

    if (currentTheme === "dark") {
      return <SunIcon className="w-6 h-6 text-yellow-500" role="button" onClick={() => setTheme("light")} />;
    } else {
      return <MoonIcon className="w-6 h-6 text-gray-900" role="button" onClick={() => setTheme("dark")} />;
    }
  };

  return <>{renderThemeChanger()}</>;
};

export default ThemeSwitcher;
