// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { fetchDisplayName, getAuthorizationToken, postUpdateDisplayName } from "@/utils/fetch";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

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
  const { email, password, discriminators } = await req.json();

  // TODO: Only allow an array of numbers, strip out anything that isn't a 4 digit number

  console.log(discriminators, email, password);

  if (!discriminators) {
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

  return await handleChangeDisplayNameInterval(token, splitDiscriminators, 5);
};

const handleChangeDisplayNameInterval = async (
  token: string,
  discriminators: string[],
  intervalTime: number = 1
) => {
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