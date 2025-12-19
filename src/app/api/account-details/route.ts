import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { Account, fetchAccount, getAuthorizationToken } from "@/utils/fetch";

export interface AccountDetailsResponse {
  account: Account | null;
  error?: string | null;
}

export const POST = async (
  req: NextRequest,
  res: NextApiResponse<AccountDetailsResponse>,
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

  if (tokenResponse.error && !tokenResponse.token) {
    return Response.json(
      { error: tokenResponse.error || "Unknown error" },
      { status: 400 },
    );
  }

  const account = await fetchAccount(tokenResponse.token || "");
  return Response.json({ account }, { status: 200 });
};
