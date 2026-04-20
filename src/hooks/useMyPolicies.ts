import React from "react";
import { ThunderSDK } from "thunder-sdk";

type TMyPolicies = Awaited<typeof ThunderSDK.accessControlPolicies.myPolicies>;
let policies: ReturnType<TMyPolicies>;

export function useMyPolicies() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [myPolicies, setMyPolicies] = React.useState<Awaited<
    typeof policies
  > | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);

    policies ??= ThunderSDK.accessControlPolicies.myPolicies();

    void (async () => {
      const response = await policies
        .catch((error) => {
          setError(error);
        })
        .finally(() => setIsLoading(false));

      if (response) setMyPolicies(response);
    })();
  }, []);

  return {
    isLoading,
    error,
    myPolicies,
  };
}
