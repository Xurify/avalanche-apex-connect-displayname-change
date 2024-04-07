"use client";

import Link from "next/link";
import ThemeSwitcher from "./ThemeSwitcher";
import AccountDropdown from "./AccountDropdown";

export const Header = () => {

  return (
    <header className="flex items-center font-bold h-[70px] p-4 border-b border-[#9c9186] dark:border-gray-500">
      <Link href="/">
        <h1 className="">(Unofficial) Avalanche Apex Connect Nickname Changer</h1>
      </Link>
      <div className="ml-auto mr-4">
        <AccountDropdown />
      </div>
      <ThemeSwitcher />
    </header>
  );
};
