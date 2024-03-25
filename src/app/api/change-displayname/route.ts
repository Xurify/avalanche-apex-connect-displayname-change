import type { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { fetchDisplayName, getAuthorizationToken, postUpdateDisplayName } from "@/utils/fetch";

export interface ChangeDisplayNameResponse {
  token?: string;
  error?: Errors | null;
  success?: boolean;
  discriminators?: string[];
  newDiscriminator?: string;
  displayName?: string;
}

export type Errors = {
  emailAddress?: string;
  password?: string;
  discriminators?: string;
};

export const POST = async (req: NextRequest, res: NextApiResponse<ChangeDisplayNameResponse>) => {
  const {
    email = "",
    password = "",
    discriminators = "",
    token: derivedToken,
  }: { email: string; password: string; discriminators: string; token?: string } = await req.json();

  if (!derivedToken) {
    const filteredDiscriminators = discriminators?.split(", ")?.filter((d: string) => /^\d{4}$/.test(d));
    if (!filteredDiscriminators.length) {
      return Response.json({ error: { discriminators: "Discriminators field is invalid" } }, { status: 400 });
    } else if (!email) {
      return Response.json({ error: { emailAddress: "Email field is invalid" } }, { status: 400 });
    } else if (!password) {
      return Response.json({ error: { password: "Password field is invalid" } }, { status: 400 });
    }
  }

  const token = derivedToken || (await getAuthorizationToken(email, password));

  if (!token) {
    return Response.json({ error: "Token cannot be fetched" }, { status: 400 });
  }

  const splitDiscriminators = discriminators.split(", ");

 // return await handleChangeDisplayNameInterval(token, splitDiscriminators, 0.7);

 const response = await handleChangeDisplayNameIntervalStream(token, splitDiscriminators, 5);
 console.log('response', response);

 return response;
  //return await handleChangeDisplayNameIntervalStream(token, splitDiscriminators, 0.7);
};

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

      fetchDisplayName(token).then(async (displayName) => {
        const nickname = displayName?.split("#")?.[0] || "";
        const discriminator = displayName?.split("#")?.[1] || "";

        if (discriminators.includes(discriminator)) {
          clearInterval(changeDisplayNameInterval);
          resolve(Response.json({ displayName, newDiscriminator: discriminator }, { status: 200 }));
        } else {
          console.log("postUpdateDisplayName", displayName);
          const updateDisplayNameResponse = await postUpdateDisplayName(token, nickname);
          if (updateDisplayNameResponse?.error) {
            resolve(Response.json({ newDiscriminator: discriminator }, { status: 500 }));
          } else {
            resolve(Response.json({ newDiscriminator: discriminator }, { status: 200 }));
          }
        }
      });
    }, intervalTime * 1000);
  });
};

const handleChangeDisplayNameIntervalStream = async (
  token: string,
  discriminators: string[],
  intervalTime: number = 1
) => {
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      const changeDisplayNameInterval = setInterval(() => {
        if (!token) {
          clearInterval(changeDisplayNameInterval);
          controller.enqueue(encoder.encode(JSON.stringify({ error: "Bearer token is missing" })));
          controller.close();
          return;
        }

        fetchDisplayName(token).then(async (displayName) => {
          const nickname = displayName?.split("#")?.[0] || "";
          const discriminator = displayName?.split("#")?.[1] || "";

          if (discriminators.includes(discriminator)) {
            clearInterval(changeDisplayNameInterval);
            controller.enqueue(encoder.encode(JSON.stringify({ displayName, newDiscriminator: discriminator })));
            controller.close();
          } else {
            console.log("postUpdateDisplayName", displayName);
            const updateDisplayNameResponse = await postUpdateDisplayName(token, nickname);
            if (updateDisplayNameResponse?.error) {
              clearInterval(changeDisplayNameInterval);
              controller.close();
            } else {
              controller.enqueue(encoder.encode(JSON.stringify({ newDiscriminator: discriminator })));
            }
          }
        });
      }, intervalTime * 1000);
    },
  });

  return new NextResponse(stream, {
    headers: { "Content-Type": "application/json" },
  });
};