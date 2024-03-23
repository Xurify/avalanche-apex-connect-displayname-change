import React from "react";
import { Inter } from "next/font/google";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons"
import { fullMatchingDigits } from "@/utils/fetch";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [allowMatchingDigits, setAllowMatchingDigits] = React.useState<boolean>(false);
  const [customDiscriminators, setCustomDiscriminators] = React.useState<string>("");
  const [discriminators, setDiscriminators] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleStart = () => {
    if (isLoading) return;
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
      .then((result) => {
        setIsLoading(false);
        if (result.error) {
          console.error(result.error);
        } else {
          const sound = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
          sound.play();
          console.log(result);
        }
      });
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

  return (
    <main className={`bg-black text-white flex min-h-screen flex-col items-center pt-12 ${inter.className}`}>
      <div className="flex flex-col w-full max-w-[500px]">
        <Label className="mb-2 block text-base text-[#B2B7FD] text-white" htmlFor="custom-discriminator">
          Custom Discriminator
        </Label>
        <div className="flex">
          <Input
            onChange={handleChangeCustomDiscriminator}
            className="p-2 bg-[#B7FDB2] border-none text-[#976A6D] focus:outline-none font-semibold"
            value={customDiscriminators}
            type="text"
            id="custom-discriminator"
          />
          <Button className="ml-2 bg-theme hover:bg-[#f7c0c3]" onClick={handleAddDiscriminator}>
            Add
          </Button>
        </div>
        <span className="text-sm text-gray-400">Separate each discriminator with a comma</span>
        <div>
          <div className="flex items-center mt-2">
            <Switch checked={allowMatchingDigits} onCheckedChange={handleCheckAllowMatchingDigits} />
            <Label className="ml-2" htmlFor="allow-matching-digits text-center">
              Allow Matching Digits
            </Label>
          </div>
          <span className="text-sm text-gray-400 mt-1">Ex. 6666, 8888, 2222</span>
        </div>
        <Button className="mt-2" onClick={handleStart} disabled={isLoading}>
          {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? 'Loading' : 'Start'}
        </Button>
        <div className="flex items-center text-sm text-gray-400 mt-2">
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
