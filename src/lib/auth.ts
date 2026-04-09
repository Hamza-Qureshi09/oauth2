import { passkeyClient } from "@better-auth/passkey/client";
import {
  adminClient,
  inferAdditionalFields,
  magicLinkClient,
  multiSessionClient,
  twoFactorClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const baseClientOpts = {
  baseURL: import.meta.env.VITE_API_ORIGIN ?? window.location.origin,
  basePath: "/auth/api",
};

export const authClient = createAuthClient({
  ...baseClientOpts,
  //   fetchOptions: {
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //   },
  plugins: [
    passkeyClient(),
    twoFactorClient(),
    magicLinkClient(),
    adminClient(),
    multiSessionClient(),
    inferAdditionalFields({
      user: {
        gender: {
          type: "string",
          required: false,
        },
        dob: {
          type: "date",
          required: false,
        },
      },
      session: {
        device: { type: "json", required: false },
      },
    }),
  ],
});
