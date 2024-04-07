import type { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { Account, fetchAccount, getAuthorizationToken } from "@/utils/fetch";
import { Errors } from "../change-displayname/route";

export interface AccountDetailsResponse {
  account: Account | null;
  error?: Errors | null;
}

export const POST = async (req: NextRequest, res: NextApiResponse<AccountDetailsResponse>) => {
  const { email = "", password = "" }: { email: string; password: string } = await req.json();

  const token = await getAuthorizationToken(email, password);

  if (!token) {
    return Response.json({ error: "Token cannot be fetched" }, { status: 400 });
  }

  const account = await fetchAccount(token);
  return Response.json({ account }, { status: 200 });

  return Response.json({ nickname: null, error: 'Unknown error' }, { status: 500 });
};
