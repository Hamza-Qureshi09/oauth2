import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { useNavigate } from "react-router";

function SelectOrganization() {
	const navigate = useNavigate();
	const { data, error, isPending } = authClient.useListOrganizations();

	console.log(data, error, isPending);

	if (error) return <div>Error loading organizations</div>;
	if (isPending) return <div>Loading organizations...</div>;

	const organizations = data ?? [];

	return (
		<div>
			{organizations.map((org) => (
				<div
					key={org.id}
					className="flex items-center justify-between p-4 border rounded"
				>
					<div>
						<h3 className="text-lg font-medium">{org.name}</h3>
						<p className="text-sm text-muted-foreground">{org.slug}</p>
					</div>
					<Button
						onClick={async () => {
							const response = await authClient.organization.setActive({
								organizationId: org.id,
							});

							if (!response.error) navigate("/" + window.location.search);
						}}
					>
						Select
					</Button>
				</div>
			))}

			{organizations.length === 0 && (
				<div className="text-center text-muted-foreground">
					No organizations found for your account.
					<Button
						onClick={() =>
							authClient.organization.create({ name: "myOrg", slug: "my-org" })
						}
					>
						Create
					</Button>
				</div>
			)}
		</div>
	);
}

export default SelectOrganization;
