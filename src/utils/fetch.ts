// const localStorageBearerToken = window.localStorage.getItem(
//   "vue-authenticate.vueauth_token"
// );

const EMAIL = "games@xurify.com";
const PASSWORD = "RpzqioPHL23hhxvkTr6T3ci4F";
const NICKNAME = "Xurify";
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
const specificDiscriminators = ["1984"];
const matchingDiscriminators = [
  ...fullMatchingDigits,
  ...specificDiscriminators,
];

export const fetchDisplayName = async (token: string) => {
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
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("fetchDisplayName", data.account.display_name);
      return data.account.display_name;
    });
};

export const postUpdateDisplayName = async (token: string) => {
  return await fetch(
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
      body: `{"nick_name":"${NICKNAME}"}`,
      method: "POST",
      mode: "cors",
      credentials: "omit",
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("updateDisplayName", data);
    });
};

export const getAuthorizationToken = async () => {
  return await fetch(
    "https://apex-connect.avalanchestudios.com/portal/default/login",
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.7",
        "cache-control": "no-cache",
        "content-type": "application/json;charset=UTF-8",
        pragma: "no-cache",
        "sec-ch-ua": '"Brave";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
      },
      referrer: "https://apex-connect.avalanchestudios.com/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: `{"email":"${EMAIL}","password":"${PASSWORD}"}`,
      method: "POST",
      mode: "cors",
      credentials: "include",
    }
  )
    .then((res) => res.json())
    .then((data) => {
      console.log("getAuthorizationToken", data?.token);
      return data.token;
    });
};
