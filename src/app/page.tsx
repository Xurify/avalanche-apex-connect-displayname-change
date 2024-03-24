"use client";

import React from "react";
import Link from "next/link";

import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { EyeIcon, EyeOffIcon, MoonIcon, SunIcon } from "lucide-react";
import { useDarkMode } from "usehooks-ts";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { fullMatchingDigits } from "@/utils/fetch";
import { cn } from "@/lib/utils";

export const Page: React.FC = () => {
  const [emailAddress, setEmailAddress] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [customDiscriminators, setCustomDiscriminators] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isPasswordHidden, setIsPasswordHidden] = React.useState<boolean>(true);
  const [allowMatchingDigits, setAllowMatchingDigits] = React.useState<boolean>(false);
  const [discriminators, setDiscriminators] = React.useState<string[]>([]);

  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const defaultValue = Boolean(localStorage?.getItem("usehooks-ts-dark-mode") || false);
  const { isDarkMode, toggle } = useDarkMode({ defaultValue, initializeWithValue: false });

  React.useEffect(() => {
    if (isDarkMode && !document.body.classList.contains("dark")) {
      document.body.classList.remove("light");
      document.body.classList.add("dark");
    } else if (!isDarkMode && document.body.classList.contains("dark")) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
    }
  }, [isDarkMode]);

  const handleStart = (e: React.ChangeEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErrorMessage(null);
  
    if (isLoading) return;
    if (emailAddress.trim() === "") {
      return;
    } else if (password.trim() === "") {
      return;
    } else if (discriminators.length === 0) {
      return;
    }

    setIsLoading(true);

    console.log("discriminators", discriminators, customDiscriminators, allowMatchingDigits);

    const combinedDiscriminators = allowMatchingDigits ? [...discriminators, ...fullMatchingDigits] : discriminators;
    const body = JSON.stringify({ discriminators: combinedDiscriminators.join(",") });

    fetch("/api/change-displayname", {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result: { error: string; token?: string }) => {
        setIsLoading(false);
        if (result.error) {
          console.error(result.error);
          setErrorMessage(result.error);
        } else {
          const sound = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
          sound.play();
          console.log(result);
        }
      })
      .catch((error) => {
        console.log("ERROR", error);
      });
  };

  const handleChangeEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailAddress(value);
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleChangeCustomDiscriminator = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomDiscriminators(value);
  };

  const handleCheckAllowMatchingDigits = () => {
    setAllowMatchingDigits(!allowMatchingDigits);
  };

  const handleAddDiscriminator = () => {
    setDiscriminators([...discriminators, customDiscriminators]);
    setCustomDiscriminators("");
  };

  const handleRemoveDiscriminator = (discriminatorToRemove: string) => {
    const newDiscriminators = discriminators.filter((discriminator) => discriminatorToRemove !== discriminator);
    setDiscriminators(newDiscriminators);
  };

  const handleTogglePasswordHidden = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  const buttonClassname = "bg-theme dark:bg-blue-500 hover:bg-[#f7c0c3] dark:hover:bg-blue-600 dark:text-white";
  const inputClassname =
    "p-2 border-none focus:outline-none font-semibold bg-[#d6ccc2] dark:bg-white/10 text-[#976A6D] dark:text-white";
  const switchClassname =
    "data-[state=checked]:bg-theme data-[state=unchecked]:bg-[#FEE7E9] dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-input";

  return (
    <div className={cn(`min-h-screen bg-[#edede9] text-[#9c9186] dark:bg-card dark:text-primary`)}>
      <header className="flex items-center justify-between font-bold h-[70px] p-4 border-b border-[#9c9186] dark:border-gray-500">
        <Link href="/">
          <h1 className="">(Unofficial) Avalanche Apex Connect Nickname Changer</h1>
        </Link>
        <div className="flex items-center">
          {isDarkMode ? <MoonIcon className="mr-2" /> : <SunIcon className="mr-2" />}
          <Switch className={switchClassname} checked={isDarkMode} onCheckedChange={toggle} />
        </div>
      </header>

      <main className="flex flex-col items-center p-4 pt-12">
        <div className="flex flex-col w-full max-w-[500px]">
          <div className="mb-2">
            <Label className="mb-0.5 block text-sm LATER-text-[#B2B7FD]" htmlFor="email-address">
              Email
            </Label>
            <Input
              onChange={handleChangeEmailAddress}
              className={inputClassname}
              value={emailAddress}
              type="text"
              id="email-address"
            />
            <span className="text-red-400">{errorMessage}</span>
          </div>
          <div className="mb-2">
            <Label className="mb-0.5 block text-sm LATER-text-[#B2B7FD]" htmlFor="password">
              Password
            </Label>

            <div className="relative">
              <Input
                onChange={handleChangePassword}
                className={inputClassname}
                value={password}
                type={isPasswordHidden ? "password" : "text"}
                id="password"
              />
              <button
                type="button"
                onClick={handleTogglePasswordHidden}
                className="absolute top-0 end-0 p-3.5 rounded-e-md dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
              >
                {isPasswordHidden ? <EyeOffIcon size="0.95rem" /> : <EyeIcon size="0.95rem" />}
              </button>
            </div>
          </div>
          <div className="mb-2">
            <Label className="mb-0.5 block text-sm LATER-text-[#B2B7FD]" htmlFor="custom-discriminator">
              Custom Discriminator
            </Label>
            <div className="flex">
              <Input
                onChange={handleChangeCustomDiscriminator}
                className={inputClassname}
                value={customDiscriminators}
                type="text"
                id="custom-discriminator"
              />
              <Button className={`ml-2 ${buttonClassname}`} onClick={handleAddDiscriminator}>
                Add
              </Button>
            </div>
          </div>
          <span className="text-sm text-[#9c9186]/70 dark:text-gray-400">Separate each discriminator with a comma</span>
          <div>
            <div className="flex items-center mt-2">
              <Switch
                className={switchClassname}
                checked={allowMatchingDigits}
                onCheckedChange={handleCheckAllowMatchingDigits}
              />
              <Label className="ml-2" htmlFor="allow-matching-digits text-center">
                Allow Matching Digits
              </Label>
            </div>
            <span className="text-sm text-[#9c9186]/70 dark:text-gray-400 mt-1">Ex. 6666, 8888, 2222</span>
          </div>
          <Button className={`mt-2 ${buttonClassname}`} onClick={handleStart} disabled={isLoading}>
            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Loading" : "Start"}
          </Button>
          <div className="flex items-center text-sm text-[#9c9186]/70 dark:text-gray-400 mt-2">
            <InfoCircledIcon />
            <span className="ml-1">This process could take a while</span>
          </div>
          <ul className="list-of-discriminators flex flex-col gap-1.5 mt-2">
            {discriminators.map((discriminator) => (
              <li className="flex" key={discriminator}>
                <button onClick={() => handleRemoveDiscriminator(discriminator)}>
                  <CircleMinus />
                </button>{" "}
                <span className="ml-2">{discriminator}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Page;

const CircleMinus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-circle-minus"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 12h8" />
  </svg>
);
