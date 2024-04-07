"use client";

import * as React from "react";
import { DropdownMenuCheckboxItemProps } from "@radix-ui/react-dropdown-menu";
import { UserCircleIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSessionStorage } from "@/lib/hooks/useSessionStorage";
import { Account } from "@/utils/fetch";

export const AccountDropdown = () => {
  const [account] = useSessionStorage<Account | null>("avalanche-apex-connect-account-details", null, {
    expireIn: 3600,
  });

  const handleUnauthenticate = () => {
    window.localStorage.removeItem("avalanche-apex-connect-token");
  };

  if (!account) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserCircleIcon className="w-6 h-6" role="button" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 mr-3 md:mr-12">
        <DropdownMenuLabel>Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {account?.display_name && <DropdownMenuItem disabled>Signed in as {account?.display_name}</DropdownMenuItem>}
        {<DropdownMenuItem onClick={handleUnauthenticate}>Unauthenticate</DropdownMenuItem>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
