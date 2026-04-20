import React from "react";
import { Outlet, useSearchParams } from "react-router";
import { Toaster } from "sonner";
import { ActionSheet } from "./components/ActionSheet";
import { DirectionProvider } from "./components/ui/direction";
import { useAppBranding } from "./hooks/useAppBranding";
import { type TScheme, useColorScheme } from "./hooks/useColorScheme";
import { useFavicon } from "./hooks/useFavicon";
import { useLanguage } from "./hooks/useLanguage";
import { applyThemeVars } from "./lib/utils";
import { ActionSheetRef } from "./registry/ActionSheet";
import { LoadingProvider } from "./contexts/Loading";
import { SWRConfig } from "swr";

function App() {
  const [searchParams] = useSearchParams();
  const { app } = useAppBranding();

  useFavicon(app?.logo);
  const { scheme } = useColorScheme(searchParams.get("theme") as TScheme);
  const { direction } = useLanguage(searchParams.get("lng"));

  React.useEffect(() => {
    if (app?.theme) applyThemeVars(app.theme);
  }, [app]);

  return (
    <SWRConfig
      value={{
        dedupingInterval: 5000,
        revalidateOnFocus: false,
        revalidateIfStale: true,
        shouldRetryOnError: false,
        revalidateOnReconnect: true,
      }}
    >
      <DirectionProvider direction={direction}>
        <LoadingProvider>
          <div className="isolate relative flex w-full h-full min-h-svh flex-col gap-5 bg-linear-to-t from-primary/10 to-transparent to-40%">
            <Outlet />
          </div>

          <ActionSheet ref={ActionSheetRef} />

          <Toaster
            theme={scheme}
            position="top-center"
            toastOptions={{
              className: "!items-start !gap-3 !rounded-2xl !p-3",
              classNames: {
                icon: "[&>svg]:!size-6 [&>svg]:mt-2",
                title: "!text-base",
                description: "!text-sm !text-muted-foreground",
                actionButton: "!p-4 !h-6 !rounded-full capitalize",
              },
            }}
          />
        </LoadingProvider>
      </DirectionProvider>
    </SWRConfig>
  );
}
export default App;
