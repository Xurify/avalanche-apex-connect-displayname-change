import { fetchDisplayName, getAuthorizationToken, postUpdateDisplayName } from "@/utils/fetch";
import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";

type Data = {
  token: string | null;
  discriminators?: string[];
  error?: Errors | null;
};

export type Errors = {
  emailAddress?: string;
  password?: string;
  discriminators?: string;
};

export const POST = async (req: NextRequest, res: NextApiResponse<Data>) => {
  const { email = '', password = '', discriminators = '' }: { email: string; password: string; discriminators: string } = await req.json();

  const filteredDiscriminators = discriminators?.split(", ")?.filter((d: string) => /^\d{4}$/.test(d));

  if (!filteredDiscriminators.length) {
    return Response.json({ error: { discriminators: "Discriminators field is invalid" } }, { status: 400 });
  } else if (!email) {
    return Response.json({ error: { emailAddress: "Email field is invalid" } }, { status: 400 });
  } else if (!password) {
    return Response.json({ error: { password: "Password field is invalid" } }, { status: 400 });
  }

  const token = await getAuthorizationToken(email, password);

  if (!token) {
    return Response.json({ error: "Token cannot be fetched" }, { status: 400 });
  }

  const splitDiscriminators = discriminators.split(", ");

  return await handleChangeDisplayNameInterval(token, splitDiscriminators, 0.7);
};

export interface ChangeDisplayNameResponse {
  error: Errors;
  success?: boolean;
  token?: string;
  newDiscriminator?: string;
}

const handleChangeDisplayNameInterval = async (
  token: string,
  discriminators: string[],
  intervalTime: number = 1
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const changeDisplayNameInterval = setInterval(() => {
      if (!token) {
        clearInterval(changeDisplayNameInterval);
        console.error("Bearer token is missing");
        reject(Response.json({ error: "Bearer token is missing" }, { status: 400 }));
      }

      fetchDisplayName(token).then((displayName) => {
        const nickname = displayName?.split("#")?.[0] || "";
        const discriminator = displayName?.split("#")?.[1] || "";

        if (discriminators.includes(discriminator)) {
          clearInterval(changeDisplayNameInterval);
          resolve(Response.json({ displayName, newDiscriminator: discriminator }, { status: 200 }));
        } else {
          console.log("postUpdateDisplayName", displayName);
          postUpdateDisplayName(token, nickname);
          resolve(Response.json({ newDiscriminator: discriminator }, { status: 200 }));
        }
      });
    }, intervalTime * 1000);
  });
};