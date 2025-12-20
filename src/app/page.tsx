"use client";

import React from "react";

import { InfoCircledIcon, ReloadIcon } from "@radix-ui/react-icons";
import { CircleMinusIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Account, fullMatchingDigits } from "@/utils/fetch";
import {
  ChangeDisplayNameResponse,
  Errors,
} from "./api/change-displayname/route";
import { AuthorizationTokenResponse } from "./api/authorize/route";
import { useSessionStorage } from "@/lib/hooks/useSessionStorage";
import { AccountDetailsResponse } from "./api/account-details/route";

export default function Page() {
  const [emailAddress, setEmailAddress] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");
  const [customDiscriminator, setCustomDiscriminator] =
    React.useState<string>("");
  const [allowMatchingDigits, setAllowMatchingDigits] =
    React.useState<boolean>(false);
  const [discriminators, setDiscriminators] = React.useState<string[]>([]);

  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);
  const [isPasswordHidden, setIsPasswordHidden] = React.useState<boolean>(true);

  const [token, setToken] = useSessionStorage<string | null>(
    "avalanche-apex-connect-token",
    null,
    { expireIn: 3600 },
  );
  const [account, setAccount] = useSessionStorage<Account | null>(
    "avalanche-apex-connect-account-details",
    null,
    { expireIn: 3600 },
  );
  const [pastDiscriminators, setPastDiscriminators] = React.useState<string[]>(
    [],
  );
  const [errorMessage, setErrorMessage] = React.useState<Errors | null>({});

  const pastDiscriminatorsListRef = React.useRef<HTMLUListElement>(null);

  React.useEffect(() => {
    if (pastDiscriminators.length > 0) {
      const listElement = pastDiscriminatorsListRef.current;
      if (listElement) {
        requestAnimationFrame(() => {
          listElement.scrollTo({
            behavior: "smooth",
            top: listElement.scrollHeight,
          });
        });
      }
    }
  }, [pastDiscriminators]);

  const handleAuthorize = () => {
    setErrorMessage(null);

    const newErrors = collectErrors();
    if (newErrors.emailAddress || newErrors.password) {
      setErrorMessage({
        emailAddress: newErrors.emailAddress,
        password: newErrors.password,
      });
      return;
    }

    const body = JSON.stringify({ email: emailAddress, password });

    fetch("/api/authorize", {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((result: AuthorizationTokenResponse) => {
        setIsLoading(false);
        if (result.token) {
          setToken(result.token);
        } else if (result.error) {
          setErrorMessage({ general: result.error });
        }
        return result;
      })
      .then((result: AuthorizationTokenResponse) => {
        if (result.token) {
          fetch("/api/account-details", {
            body,
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => res.json())
            .then((result: AccountDetailsResponse) => {
              setIsLoading(false);
              if (result.account) {
                console.log(result.account);
                setAccount(result.account);
              } else if (result.error) {
                console.error(result.error);
                setErrorMessage({ general: result.error });
              }
            });
        }
      });
  };

  const collectErrors = (): Errors => {
    const newErrors: Errors = {};
    if (!token && emailAddress.trim() === "") {
      newErrors.emailAddress = "Email address is missing";
    }
    if (!token && password.trim() === "") {
      newErrors.password = "Password is missing";
    }
    if (!allowMatchingDigits && discriminators.length === 0) {
      newErrors.discriminators = "No discriminators were added";
    }
    return newErrors;
  };

  const handleStart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isLoading) return;

    const newErrors = collectErrors();
    if (Object.keys(newErrors).length > 0) {
      setErrorMessage(newErrors);
      return;
    }

    setIsLoading(true);
    setPastDiscriminators([]);

    const combinedDiscriminators = allowMatchingDigits
      ? [...discriminators, ...fullMatchingDigits]
      : discriminators;
    const body = JSON.stringify({
      email: emailAddress,
      password,
      discriminators: combinedDiscriminators.join(", "),
      token,
    });

    const performRequest = async (): Promise<void> => {
      try {

        const response = await fetch("/api/change-displayname", {
          body,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.body) {
          throw new Error("No response body received");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        let buffer = "";
        let isCompleted = false;

        try {
          while (!isCompleted) {
            setIsSearching(true);
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Process complete lines (JSON objects separated by newlines)
            const lines = buffer.split('\n');
            buffer = lines.pop() || ""; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.trim()) {
                try {
                  const data = JSON.parse(line.trim());

                  if (data?.success) {
                    setPastDiscriminators((previousPastDiscriminators) => [
                      ...previousPastDiscriminators,
                      data.newDiscriminator,
                    ]);

                    isCompleted = true;
                    setIsSearching(false);
                    setIsLoading(false);
                    return; // Exit successfully
                  } else if (data?.error) {
                    if (data.error.includes('timed out') || data.error.includes('timeout')) {
                      setPastDiscriminators((previousPastDiscriminators) => [
                        ...previousPastDiscriminators,
                        'Retrying...',
                      ]);
                      reader.releaseLock();
                      setTimeout(() => performRequest(), 1000);
                      return;
                    } else {
                      console.error('Error occurred:', data.error);
                      setErrorMessage({ general: data.error });
                      isCompleted = true;
                      setIsSearching(false);
                      setIsLoading(false);
                      return;
                    }
                  } else if (data?.currentDiscriminator) {
                    setPastDiscriminators((previousPastDiscriminators) => {
                      if (!previousPastDiscriminators.includes(data.currentDiscriminator)) {
                        return [...previousPastDiscriminators, data.currentDiscriminator];
                      }
                      return previousPastDiscriminators;
                    });
                  }
                } catch (parseError) {
                  console.warn("Failed to parse streaming data:", line, parseError);
                }
              }
            }
          }

          setPastDiscriminators((previousPastDiscriminators) => [
            ...previousPastDiscriminators,
            'Stream ended, retrying...',
          ]);
          setTimeout(() => performRequest(), 1000);

        } catch (streamError) {
          console.error('Stream error:', streamError);
          setPastDiscriminators((previousPastDiscriminators) => [
            ...previousPastDiscriminators,
            'Stream error, retrying...',
          ]);
          setTimeout(() => performRequest(), 2000);
        } finally {
          reader.releaseLock();
        }

      } catch (error) {
        console.error('Request failed:', error);
        setPastDiscriminators((previousPastDiscriminators) => [
          ...previousPastDiscriminators,
          `Request failed, retrying... (${error instanceof Error ? error.message : String(error)})`,
        ]);
        setTimeout(() => performRequest(), 5000);
      }
    };

    // Start the first request
    performRequest();
  };

  const handleChangeEmailAddress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailAddress(value);
  };

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleChangeCustomDiscriminator = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
    const newDiscriminators = discriminators.filter(
      (discriminator) => discriminatorToRemove !== discriminator,
    );
    setDiscriminators(newDiscriminators);
  };

  const handleTogglePasswordHidden = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };


  const handleUnauthorize = () => {
    setToken(null);
    setAccount(null);
  };

  const buttonClassname =
    "bg-theme dark:bg-blue-500 hover:bg-[#f7c0c3] dark:hover:bg-blue-600 dark:text-white";
  const inputClassname =
    "p-2 focus:outline-none font-semibold bg-[#d6ccc2] dark:bg-white/10 text-[#976A6D] dark:text-white";
  const switchClassname =
    "data-[state=checked]:bg-theme data-[state=unchecked]:bg-[#FEE7E9] dark:data-[state=checked]:bg-blue-500 dark:data-[state=unchecked]:bg-input";

  const generateInputClassname = (hasError: boolean) => {
    return hasError
      ? inputClassname + " border border-red-500"
      : inputClassname;
  };

  return (
    <main className="flex flex-col items-center p-4 pt-12">
      <div className="flex flex-col w-full max-w-[500px]">
        <div className="mb-4">
          <div className="bg-red-600 text-white font-bold text-center p-1 rounded">
            Obviously, you should never give out your credentials!!!
          </div>
          <div className="text-sm mt-2 text-black dark:text-white">
            Instead check out the source code:{" "}
            <a
              href="https://github.com/Xurify/avalanche-apex-connect-displayname-change"
              className="text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
          <span className="text-sm block -mt-1 text-black dark:text-white">
            But if you are that flipping lazy I&apos;m not stopping you...
          </span>
        </div>
        <div className="mb-2">
          <Label className="mb-0.5 block text-sm" htmlFor="email-address">
            Email
          </Label>
          <Input
            onChange={handleChangeEmailAddress}
            className={generateInputClassname(!!errorMessage?.emailAddress)}
            value={account?.email || emailAddress}
            type="text"
            id="email-address"
            disabled={!!token}
          />
        </div>
        <div className="mb-2">
          <Label className="mb-0.5 block text-sm" htmlFor="password">
            Password
          </Label>
          <div className="relative">
            <Input
              onChange={handleChangePassword}
              className={generateInputClassname(!!errorMessage?.password)}
              value={password}
              type={isPasswordHidden ? "password" : "text"}
              id="password"
              disabled={!!token}
            />
            <button
              type="button"
              onClick={handleTogglePasswordHidden}
              className="absolute top-0 end-0 p-3.5 rounded-e-md dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600"
            >
              {isPasswordHidden ? (
                <EyeOffIcon size="0.95rem" />
              ) : (
                <EyeIcon size="0.95rem" />
              )}
            </button>
          </div>
        </div>
        <Button
          className={`mb-4 ${
            !!token
              ? "bg-red-500 dark:text-black hover:bg-red-400 dark:text-black"
              : "bg-white hover:bg-white/90 text-[#9c9186] dark:text-black"
          }`}
          onClick={!!token ? handleUnauthorize : handleAuthorize}
        >
          {token ? "Unauthenticate" : "Authenticate"}
        </Button>
        <div className="mb-2">
          <Label
            className="mb-0.5 block text-sm"
            htmlFor="custom-discriminator"
          >
            Custom Discriminator(s) <br />
            <span className="text-xs text-gray-500">
              Numbers that you would like to use for your name
            </span>
          </Label>
          <div className="flex">
            <Input
              onChange={handleChangeCustomDiscriminator}
              className={inputClassname}
              value={customDiscriminator}
              type="text"
              id="custom-discriminator"
            />
            <Button
              className={`ml-2 ${buttonClassname}`}
              onClick={handleAddDiscriminator}
            >
              Add
            </Button>
          </div>
        </div>
        <span className="text-sm text-[#9c9186]/70 dark:text-gray-400">
          Separate each discriminator with a comma
        </span>
        <div>
          <div className="flex items-center mt-2">
            <Switch
              className={switchClassname}
              checked={allowMatchingDigits}
              onCheckedChange={handleCheckAllowMatchingDigits}
            />
            <Label className="ml-2" htmlFor="allow-matching-digits text-center">
              Allow Any Matching Digits
            </Label>
          </div>
          <span className="text-sm text-[#9c9186]/70 dark:text-gray-400 mt-1">
            Ex. 6666, 8888, 2222
          </span>
        </div>
        <Button
          className={`mt-2 ${buttonClassname}`}
          onClick={handleStart}
          disabled={isLoading}
        >
          {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Loading" : "Start"}
        </Button>
        <div className="flex items-center text-sm text-[#9c9186]/70 dark:text-gray-400 mt-2">
          <InfoCircledIcon />
          <span className="ml-1">This will probably take a while</span>
        </div>
        <ul className="list-of-discriminators flex flex-col gap-1.5 mt-2">
          {discriminators.map((discriminator) => (
            <li className="flex" key={discriminator}>
              <button onClick={() => handleRemoveDiscriminator(discriminator)}>
                <CircleMinusIcon />
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
              <span className="text-red-400 dark:text-red-400 text-sm">
                {message}
              </span>
            </div>
          ))}
        </div>
      )}

      {pastDiscriminators.length > 0 && (
        <div className="max-w-[500px] w-full">
          <div className="font-medium text-sm mb-2">
            Past Discriminators:
          </div>
          <div className="dark:bg-white/10 w-full p-4 rounded relative">
            <ul
              className="w-full h-[200px] overflow-y-auto"
              ref={pastDiscriminatorsListRef}
            >
              {pastDiscriminators.map((discriminator, index) => (
                <li key={`${discriminator}-${index}`}>{discriminator}</li>
              ))}
            </ul>
            {isSearching && (
              <span className="flex h-3 w-3 -top-1.5 -right-1.5 absolute">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
