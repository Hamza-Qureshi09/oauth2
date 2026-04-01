import React from "react";
import { getAuthCapabilities } from "@/lib/api";

let caps: Promise<string[]>;

export function useCapabilities() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [capabilities, setCapabilities] = React.useState<string[] | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);

    caps ??= getAuthCapabilities();

    void (async () => {
      const app = await caps
        .catch((error) => {
          setError(error);
        })
        .finally(() => setIsLoading(false));

      if (app) setCapabilities(app);
    })();
  }, []);

  return {
    isLoading,
    error,
    capabilities,
  };
}
