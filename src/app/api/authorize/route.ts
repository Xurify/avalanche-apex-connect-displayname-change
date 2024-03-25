import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { getAuthorizationToken } from "@/utils/fetch";
import { Errors } from "../change-displayname/route";

export interface AuthorizationTokenResponse {
  token: string | null;
  discriminators?: string[];
  error?: Errors | null;
};

export const POST = async (req: NextRequest, res: NextApiResponse<AuthorizationTokenResponse>) => {
  const { email = "", password = "" }: { email: string; password: string } = await req.json();

  const token = await getAuthorizationToken(email, password);

  if (!token) {
    return Response.json({ error: "Token cannot be fetched" }, { status: 400 });
  }
  return Response.json({ token }, { status: 200 });
};
