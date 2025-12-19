export const fullMatchingDigits = [
  "0000",
  "1111",
  "2222",
  "3333",
  "4444",
  "5555",
  "6666",
  "7777",
  "8888",
  "9999",
];

export interface AccountResponse {
  account: Account;
  error?: "Unauthorized";
}

export interface Account {
  id: string;
  email: string;
  nick_name: string;
  updated_at: Date;
  state: number;
  promo_email_ok: boolean;
  language: string;
  mark_delete_ts: MarkDeleteTimestamp;
  temporary: boolean;
  email_verified: boolean;
  country_code: string;
  nickname_number: number;
  display_name: string;
}

export interface MarkDeleteTimestamp {
  time: Date;
  valid: boolean;
}

export const fetchAccount = async (token: string): Promise<Account | null> => {
  try {
    return await fetch(
      "https://apex-connect.avalanchestudios.com/api/v1/account",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.5",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Chromium";v="122", "Not(A:Brand";v="24", "Brave";v="122"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-ava-authorization": `Bearer ${token}`,
        },
        referrer: "https://apex-connect.avalanchestudios.com/settings",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "omit",
      },
    )
      .then((res) => res.json())
      .then((response: AccountResponse) => {
        return response?.account ?? null;
      });
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const fetchDisplayName = async (
  token: string,
): Promise<string | null> => {
  try {
    const response = await fetch(
      "https://apex-connect.avalanchestudios.com/api/v1/account",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.5",
          "cache-control": "no-cache",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Chromium";v="122", "Not(A:Brand";v="24", "Brave";v="122"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-ava-authorization": `Bearer ${token}`,
        },
        referrer: "https://apex-connect.avalanchestudios.com/settings",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "omit",
      },
    );
    const data = await response.json();
    return data?.account?.display_name ?? null;
  } catch (error) {
    console.error("Error fetching display name:", error);
    return null;
  }
};

// TODO: Verify this response
export const postUpdateDisplayName = async (
  token: string,
  nickname: string,
): Promise<{
  nick_name?: string;
  error?: "Unauthorized" | "Error updating display name";
} | null> => {
  try {
    const response = await fetch(
      "https://apex-connect.avalanchestudios.com/api/v1/account/change_nick_name",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.5",
          "cache-control": "no-cache",
          "content-type": "application/json;charset=UTF-8",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Chromium";v="122", "Not(A:Brand";v="24", "Brave";v="122"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
          "x-ava-authorization": `Bearer ${token}`,
        },
        referrer: "https://apex-connect.avalanchestudios.com/settings",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `{"nick_name":"${nickname}"}`,
        method: "POST",
        mode: "cors",
        credentials: "omit",
      },
    );

    const data = await response.json();
    if (!data?.error) {
      return {
        nick_name: data.nick_name || "",
      };
    }

    return {
      error: data.error || "Error updating display name",
    };
  } catch (error) {
    console.error("Error updating display name:", error);
    return {
      error: "Error updating display name",
    };
  }
};

export interface LoginResponse {
  token: string;
  login_days_streak: number;
  last_login: number;
  account_id: string;
  user_id: string;
  approved_policies: ApprovedPolicy[];
  is_limited_account: boolean;
}

export interface ApprovedPolicy {
  id: string;
  policy_id: string;
  user_id: string;
  policy_version_id: string;
  project: string;
  platform: string;
  policy_identifier: string;
  text_hash: string;
  approved_at: Date;
  locale: string;
  platform_region: string;
}

export const getAuthorizationToken = async (
  email: string,
  password: string,
): Promise<{ token: string | null; error?: string | null }> => {
  try {
    const response = await fetch(
      "https://apex-connect.avalanchestudios.com/portal/default/login",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.7",
          "cache-control": "no-cache",
          "content-type": "application/json;charset=UTF-8",
          pragma: "no-cache",
          "sec-ch-ua":
            '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "sec-gpc": "1",
        },
        referrer: "https://apex-connect.avalanchestudios.com/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `{"email":"${email}","password":"${password}"}`,
        method: "POST",
        mode: "cors",
        credentials: "include",
      },
    );

    const data = await response.json();
    if (!!data?.token) {
      return {
        token: data?.token,
        error: null,
      };
    } else {
      const error =
        data?.error === "Unauthorized" ? "Invalid credentials" : data?.error;
      return {
        token: null,
        error: error ?? "Unknown error",
      };
    }
  } catch (error) {
    console.error("Error fetching authorization token:", error);
    return {
      token: null,
      error: "Failed to fetch token",
    };
  }
};
