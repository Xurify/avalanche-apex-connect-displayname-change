import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { fullMatchingDigits } from "@/utils/fetch";

interface HomeProps {
  isDarkMode: boolean;
}

export const Home: React.FC<HomeProps> = ({ isDarkMode }) => {
  const [emailAddress, setEmailAddress] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [customDiscriminators, setCustomDiscriminators] = React.useState<string>("");
  
  const [allowMatchingDigits, setAllowMatchingDigits] = React.useState<boolean>(false);
  const [discriminators, setDiscriminators] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  
  const handleStart = () => {
    if (isLoading) return;
    if (emailAddress.trim() === '') {
      return;
    } else if (password.trim() === '') {
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

  const buttonClassname = isDarkMode ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-theme hover:bg-[#f7c0c3]";
  const inputClassname = isDarkMode
    ? "p-2 border-none focus:outline-none font-semibold"
    : "p-2 border-none focus:outline-none font-semibold bg-[#B7FDB2] text-[#976A6D]";
  const switchClassname = isDarkMode
    ? "data-[state=checked]:bg-blue-500"
    : "data-[state=checked]:bg-theme data-[state=unchecked]:bg-[#FEE7E9]";

  return (
    <main className="flex flex-col items-center pt-12">
      <div className="flex flex-col w-full max-w-[500px]">
        <div className="mb-2">
          <Label className="mb-0.5 block text-sm LATER-text-[#B2B7FD]" htmlFor="email-address">
            Email
          </Label>
          <Input
            onChange={handleChangeCustomDiscriminator}
            className={inputClassname}
            value={customDiscriminators}
            type="text"
            id="email-address"
          />
        </div>
        <div className="mb-2">
          <Label className="mb-0.5 block text-sm LATER-text-[#B2B7FD]" htmlFor="password">
            Password
          </Label>
          <Input
            onChange={handleChangeCustomDiscriminator}
            className={inputClassname}
            value={customDiscriminators}
            type="text"
            id="password"
          />
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
        <span className="text-sm text-gray-400">Separate each discriminator with a comma</span>
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
          <span className="text-sm text-gray-400 mt-1">Ex. 6666, 8888, 2222</span>
        </div>
        <Button className={`mt-2 ${buttonClassname}`} onClick={handleStart} disabled={isLoading}>
          {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Loading" : "Start"}
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
};

export default Home;

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
