import { passkeyClient } from "@better-auth/passkey/client";
import {
	adminClient,
	magicLinkClient,
	twoFactorClient,
	organizationClient,
} from "better-auth/client/plugins";
// import { oauthProviderClient } from "@better-auth/oauth-provider/client";
import { createAuthClient } from "better-auth/react";

const baseClientOpts = {
	baseURL: import.meta.env.VITE_API_ORIGIN ?? window.location.origin,
	basePath: "/auth/api",
};

export const authClient = createAuthClient({
	...baseClientOpts,
	plugins: [
		passkeyClient(),
		twoFactorClient(),
		magicLinkClient(),
		adminClient(),
		organizationClient(),
	],
});

// export const oauth2Client = createAuthClient({
// 	...baseClientOpts,
// 	plugins: [oauthProviderClient()],
// });
