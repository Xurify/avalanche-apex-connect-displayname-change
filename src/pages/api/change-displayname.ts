// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { fetchDisplayName, fullMatchingDigits, getAuthorizationToken, postUpdateDisplayName } from "@/utils/fetch";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  token: string;
  discriminators?: string[];
  error?: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  const token = await getAuthorizationToken();

  console.log(req.body?.discriminators);
  if (!(req.body?.discriminators as string)?.trim()) {
    res.status(400).json({ token, error: 'Discriminators field is invalid' });
  };
  
  const discriminators = ((req.body?.discriminators || '') as string).split(', ');
  console.log('discriminators', discriminators);
  res.status(200).json({ discriminators, token });
  return;
  handleChangeDisplayNameInterval(token, discriminators, 0.7);
  res.status(200).json({ discriminators, token });
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
      const discriminator = displayName?.split("#")?.[1];
      if (discriminators.includes(discriminator)) {
        clearInterval(changeDisplayNameInterval);
        // const sound = new Audio("https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3");
        // sound.play();
      } else {
        console.log('postUpdateDisplayName');
        return;
        postUpdateDisplayName(token);
      }
    });
    // Be generous here please :)
  }, intervalTime * 1000);
};
