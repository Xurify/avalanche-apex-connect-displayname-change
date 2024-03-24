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
import { ChangeDisplayNameResponse, Errors } from "./api/change-displayname/route";

export default function Page() {
  const [emailAddress, setEmailAddress] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [customDiscriminator, setCustomDiscriminator] = React.useState<string>("");

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isPasswordHidden, setIsPasswordHidden] = React.useState<boolean>(true);
  const [allowMatchingDigits, setAllowMatchingDigits] = React.useState<boolean>(false);
  const [discriminators, setDiscriminators] = React.useState<string[]>([]);

  const [errorMessage, setErrorMessage] = React.useState<Errors | null>({});

  const collectErrors = (): Errors => {
    const newErrors: Errors = {};
    if (emailAddress.trim() === "") {
      newErrors.emailAddress = "Email address is missing";
    }
    if (password.trim() === "") {
      newErrors.password = "Password is missing";
    }
    if (!allowMatchingDigits && discriminators.length === 0) {
      newErrors.discriminators = "No discriminators were added";
    }
    return newErrors;
  };

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLoading) return;

    const newErrors = collectErrors();
    if (Object.keys(newErrors).length > 0) {
      setErrorMessage(newErrors);
      return;
    }

    setIsLoading(true);

    const combinedDiscriminators = allowMatchingDigits ? [...discriminators, ...fullMatchingDigits] : discriminators;
    const body = JSON.stringify({ email: emailAddress, password, discriminators: combinedDiscriminators.join(", ") });

    fetch("/api/change-displayname", {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result: ChangeDisplayNameResponse) => {
        setIsLoading(false);
        if (result.error) {
          console.error(result.error);
          setErrorMessage(result.error);
        } else {
          if (result.success) {
            const sound = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
            sound.play();
          }
          console.log(result);
        }
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
    setCustomDiscriminator(value);
  };

  const handleCheckAllowMatchingDigits = () => {
    setAllowMatchingDigits(!allowMatchingDigits);
  };

  const handleAddDiscriminator = () => {
    if (customDiscriminator.trim() === "") return;
    if (!customDiscriminator.match(/^\d{4}$/)) return;
    setDiscriminators([...discriminators, customDiscriminator]);
    setCustomDiscriminator("");
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
    "p-2 focus:outline-none font-semibold bg-[#d6ccc2] dark:bg-white/10 text-[#976A6D] dark:text-white";
  const switchClassname =
    "data-[state=checked]:bg-theme data-[state=unchecked]:bg-[#FEE7E9] dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-input";

  const generateInputClassname = (hasError?: boolean) => {
    return hasError ? inputClassname + " border border-red-500" : inputClassname;
  };

  return (
    <main className="flex flex-col items-center p-4 pt-12">
      <div className="flex flex-col w-full max-w-[500px]">
        <div className="mb-2">
          <Label className="mb-0.5 block text-sm LATER-text-[#B2B7FD]" htmlFor="email-address">
            Email
          </Label>
          <Input
            onChange={handleChangeEmailAddress}
            className={generateInputClassname(!!errorMessage?.emailAddress)}
            value={emailAddress}
            type="text"
            id="email-address"
          />
        </div>
        <div className="mb-2">
          <Label className="mb-0.5 block text-sm LATER-text-[#B2B7FD]" htmlFor="password">
            Password
          </Label>

          <div className="relative">
            <Input
              onChange={handleChangePassword}
              className={generateInputClassname(!!errorMessage?.password)}
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
              value={customDiscriminator}
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

      {errorMessage && (
        <div className="flex flex-col gap-2 w-full  max-w-[500px]">
          {Object.values(errorMessage).map((message) => (
            <div
              className="bg-red-100 dark:bg-red-50 border border-red-400 dark:border-red-400 px-2 py-1 rounded w-full"
              key={message}
            >
              <span className="text-red-400 dark:text-red-400 text-sm">{message}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

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
