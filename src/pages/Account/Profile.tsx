import { authClient } from "@/lib/auth";

function Profile() {
  const { data } = authClient.useSession();

  return <div>{data?.user.name}</div>;
}
export default Profile;
