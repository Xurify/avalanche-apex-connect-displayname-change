import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { getAuthorizationToken } from "@/utils/fetch";
import { Errors } from "../change-displayname/route";

export interface AuthorizationTokenResponse {
  token: string | null;
  discriminators?: string[];
  error?: string | null;
}

export const POST = async (
  req: NextRequest,
  res: NextApiResponse<AuthorizationTokenResponse>,
) => {
  const { email = "", password = "" }: { email: string; password: string } =
    await req.json();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  if (!password) {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  const tokenResponse = await getAuthorizationToken(email, password);

  if (tokenResponse.error) {
    return Response.json(
      { error: tokenResponse.error || "Failed to get token" },
      { status: 400 },
    );
  }
  return Response.json({ token: tokenResponse.token }, { status: 200 });
};
