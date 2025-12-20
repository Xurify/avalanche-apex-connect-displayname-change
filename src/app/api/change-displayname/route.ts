import type { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import {
  fetchDisplayName,
  getAuthorizationToken,
  postUpdateDisplayName,
} from "@/utils/fetch";

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
  general?: string;
};

export const POST = async (
  req: NextRequest,
  res: NextApiResponse<ChangeDisplayNameResponse>,
) => {
  const {
    email = "",
    password = "",
    discriminators = "",
    token: derivedToken,
  }: {
    email: string;
    password: string;
    discriminators: string;
    token?: string;
  } = await req.json();

  if (!derivedToken) {
    const filteredDiscriminators = discriminators
      ?.split(", ")
      ?.filter((d: string) => /^\d{4}$/.test(d));
    if (!filteredDiscriminators.length) {
      return Response.json(
        { error: { discriminators: "Discriminators field is invalid" } },
        { status: 400 },
      );
    } else if (!email) {
      return Response.json(
        { error: { emailAddress: "Email field is invalid" } },
        { status: 400 },
      );
    } else if (!password) {
      return Response.json(
        { error: { password: "Password field is invalid" } },
        { status: 400 },
      );
    }
  }

  const token =
    derivedToken || (await getAuthorizationToken(email, password))?.token;

  if (!token) {
    return Response.json({ error: "Token cannot be fetched" }, { status: 400 });
  }

  const splitDiscriminators = discriminators.split(", ");

  const response = await handleChangeDisplayNameIntervalStream(
    token,
    splitDiscriminators,
    0.7,
  );

  return response;
};

const activeIntervals = new Map<string, { interval: NodeJS.Timeout }>();

const removeInterval = (intervalId: string) => {
  const entry = activeIntervals.get(intervalId);
  if (entry) {
    clearInterval(entry.interval);
    activeIntervals.delete(intervalId);
  }
};

const cleanupStreamResources = (intervalId: string) => {
  removeInterval(intervalId);
};

const handleChangeDisplayNameIntervalStream = async (
  token: string,
  discriminators: string[],
  intervalTime: number = 1,
) => {
  let streamIntervalId: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let attempts = 0;
      const maxAttempts = 3000;
      const startTime = Date.now();
      const intervalId = `${token}-${Date.now()}`;
      streamIntervalId = intervalId;

      const sendProgress = (data: any) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        } catch (error) {
        }
      };

      const cleanup = () => {
        cleanupStreamResources(intervalId);
        try {
          controller.close();
        } catch (error) {
        }
      };

      const finishWithSuccess = (displayName: string, discriminator: string) => {
        sendProgress({
          success: true,
          displayName,
          newDiscriminator: discriminator,
          attempts,
          duration: Date.now() - startTime,
        });
        cleanup();
      };

      const finishWithError = (error: string) => {
        sendProgress({
          error,
          attempts,
          duration: Date.now() - startTime,
        });
        cleanup();
      };

      if (!token) {
        finishWithError("Bearer token is missing");
        return;
      }

      let currentInterval = intervalTime * 1000;
      let consecutiveErrors = 0;
      const maxConsecutiveErrors = 3;
      let changeDisplayNameInterval: NodeJS.Timeout;

      const attemptChange = async () => {
        try {
          attempts++;

          if (attempts >= maxAttempts) {
            finishWithError(`Maximum attempts (${maxAttempts}) exceeded`);
            return;
          }

          const displayName = await fetchDisplayName(token);
          if (!displayName) {
            consecutiveErrors++;
            if (consecutiveErrors >= maxConsecutiveErrors) {
              finishWithError("Failed to fetch display name after multiple attempts");
              return;
            }
            sendProgress({ attempt: attempts, status: "retrying_fetch", error: "Failed to fetch display name" });
            return;
          }

          consecutiveErrors = 0;

          const nickname = displayName.split("#")?.[0] || "";
          const discriminator = displayName.split("#")?.[1] || "";

          sendProgress({
            attempt: attempts,
            currentDisplayName: displayName,
            currentDiscriminator: discriminator,
            targetDiscriminators: discriminators,
            status: "checking_match",
          });

          if (discriminators.includes(discriminator)) {
            finishWithSuccess(displayName, discriminator);
            return;
          }

          sendProgress({
            attempt: attempts,
            status: "updating_display_name",
            currentDiscriminator: discriminator,
          });

          const updateResponse = await postUpdateDisplayName(token, nickname);
          if (updateResponse?.error) {
            finishWithError(`Failed to update display name: ${updateResponse.error}`);
            return;
          }

          sendProgress({
            attempt: attempts,
            status: "display_name_updated",
            message: "Waiting for discriminator change...",
          });

        } catch (error) {
          consecutiveErrors++;
          if (consecutiveErrors >= maxConsecutiveErrors) {
            finishWithError(`Too many consecutive errors: ${error instanceof Error ? error.message : String(error)}`);
            return;
          }

          sendProgress({
            attempt: attempts,
            status: "error",
            error: error instanceof Error ? error.message : String(error),
            willRetry: true,
          });

          currentInterval = Math.min(currentInterval * 1.5, 10000);
        }
      };

      changeDisplayNameInterval = setInterval(attemptChange, currentInterval);

      activeIntervals.set(intervalId, { interval: changeDisplayNameInterval });

      attemptChange();
    },
    cancel() {
      if (streamIntervalId) {
        cleanupStreamResources(streamIntervalId);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Transfer-Encoding": "chunked",
      "X-Accel-Buffering": "no", // Disable nginx buffering for Vercel
    },
  });
};
