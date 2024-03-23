// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { fetchDisplayName, getAuthorizationToken, postUpdateDisplayName } from "@/utils/fetch";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  token: string | null;
  discriminators?: string[];
  error?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const email: string = req.body?.email?.trim() || "";
  const password: string = req.body?.password?.trim() || "";
  const discriminators: string = req.body?.discriminators?.trim() || "";

  // TODO: Only allow an array of numbers, strip out anything that isn't a 4 digit number

  const token = await getAuthorizationToken(email, password);

  console.log(discriminators, password);

  if (!token) {
    return res.status(400).json({ token, error: "Token cannot be fetched" });
  }

  if (!discriminators) {
    return res.status(400).json({ token, error: "Discriminators field is invalid" });
  } else if (!email) {
    return res.status(400).json({ token, error: "Email field is invalid" });
  } else if (!password) {
    return res.status(400).json({ token, error: "Password field is invalid" });
  }

  const splitDiscriminators = discriminators.split(", ");
  res.status(200).json({ discriminators: splitDiscriminators, token });

  handleChangeDisplayNameInterval(token, splitDiscriminators, 0.7);
  res.status(200).json({ discriminators: splitDiscriminators, token });
}

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
        // const sound = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
        // sound.play();
      } else {
        console.log("postUpdateDisplayName");
        return;
        postUpdateDisplayName(token, nickname);
      }
    });
    // Be generous here please :)
  }, intervalTime * 1000);
};
