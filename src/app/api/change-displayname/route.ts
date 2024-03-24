// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { fetchDisplayName, getAuthorizationToken, postUpdateDisplayName } from "@/utils/fetch";
import type { NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

type Data = {
  token: string | null;
  discriminators?: string[];
  error?: string | null;
};

export const POST = async (req: NextRequest, res: NextApiResponse<Data>) => {
  const { email, password, discriminators } = await req.json();

  // const email: string = req.body?.email?.trim() || "";
  // const password: string = req.body?.password?.trim() || "";
  // const discriminators: string = req.body?.discriminators?.trim() || "";

  // TODO: Only allow an array of numbers, strip out anything that isn't a 4 digit number

  console.log(discriminators, password);

  if (!discriminators) {
    return Response.json({ error: "Discriminators field is invalid" }, { status: 400 });
  } else if (!email) {
    return Response.json({ error: "Email field is invalid" }, { status: 400 });
  } else if (!password) {
    return Response.json({ error: "Password field is invalid" }, { status: 400 });
  }

  const token = await getAuthorizationToken(email, password);

  if (!token) {
    return Response.json({ error: "Token cannot be fetched" }, { status: 400 });
  }

  const splitDiscriminators = discriminators.split(", ");

  handleChangeDisplayNameInterval(token, splitDiscriminators, 0.7);
  return Response.json({ discriminators: splitDiscriminators, token }, { status: 200 });
};

const handleChangeDisplayNameInterval = (token: string, discriminators: string[], intervalTime: number = 1) => {
  const changeDisplayNameInterval = setInterval(() => {
    if (!token) {
      clearInterval(changeDisplayNameInterval);
      console.log("WHERE IS THE BEARER TOKEN?!?! 😡");
      return;
    }

    fetchDisplayName(token).then((displayName) => {
      console.log("displayName", displayName);
      const nickname = displayName?.split("#")?.[0] || "";
      const discriminator = displayName?.split("#")?.[1] || "";
      if (discriminators.includes(discriminator)) {
        clearInterval(changeDisplayNameInterval);
      } else {
        console.log("postUpdateDisplayName");
        return;
        postUpdateDisplayName(token, nickname);
      }
    });
    // Be generous here please :)
  }, intervalTime * 1000);
};
