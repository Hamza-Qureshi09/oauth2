import { Navigate, Outlet } from "react-router";
import { authClient } from "@/lib/auth";

function Account() {
	const { data, isPending } = authClient.useSession();

	if (data && !isPending) {
		if (!data.session.activeOrganizationId) {
			return <Navigate to={"/select-organization" + window.location.search} />;
		} else if (new URLSearchParams(window.location.search).has("client_id")) {
			// eslint-disable-next-line react-hooks/immutability
			window.location.href =
				new URL(
					"/oauth/authorize",
					import.meta.env.VITE_API_ORIGIN,
				).toString() + window.location.search;

			return;
		}
	}

	if (!data && !isPending)
		return <Navigate to={"/login" + window.location.search} />;

	return <Outlet />;
}

export default Account;
