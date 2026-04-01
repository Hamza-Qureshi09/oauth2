import React from "react";
import { getAppBranding, type TAppBranding } from "@/lib/api";

let appBrandingPromise: Promise<TAppBranding>;

export function useAppBranding() {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [app, setApp] = React.useState<TAppBranding | null>(null);

  React.useEffect(() => {
    setIsLoading(true);
    setError(null);

    appBrandingPromise ??= getAppBranding();

    void (async () => {
      const app = await appBrandingPromise
        .catch((error) => {
          setError(error);
        })
        .finally(() => setIsLoading(false));

      if (app?.name) setApp(app);
    })();
  }, []);

  return {
    isLoading,
    error,
    app,
  };
}
