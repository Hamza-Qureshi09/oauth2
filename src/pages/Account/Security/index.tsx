import Item from "@/components/Item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppBranding } from "@/hooks/useAppBranding";
import { authClient } from "@/lib/auth";
import {
  AsteriskSquareIcon,
  BrickWallShieldIcon,
  CheckCircle2,
  KeyIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import useSWR from "swr";
import SetupTwoFactor from "./2FA/SetupTwoFactor";
import { useLoading } from "@/contexts/Loading";
import { Badge } from "@/components/ui/badge";
import DisableTwoFactor from "./2FA/DisableTwoFactor";
import { DeviceSessions } from "./DeviceSessions";

function Security() {
  const { t } = useTranslation();

  const { setLoading } = useLoading();
  const { data: userSession } = authClient.useSession();
  const { app } = useAppBranding();

  const { data, isLoading, mutate } = useSWR(
    "oauthPasskeyList",
    () => authClient.passkey.listUserPasskeys(),
  );

  const passkeyCount = data?.data?.length ?? 0;

  const SecurityMethods = React.useMemo(
    () => [
      {
        icon: BrickWallShieldIcon,
        label: "2-step verification",
        value: "2step",
        orientation: "vertical",
        content: userSession?.user.twoFactorEnabled
          ? (
            <Badge variant={"success"} className="max-w-fit">
              <CheckCircle2 className="fill-success stroke-background" />
              {t("Two factor Enabled")}
            </Badge>
          )
          : (
            <p className="text-sm text-muted-foreground">
              {t("Two factor isn't enabled")}
            </p>
          ),
        right: () => {
          const twoFactorEnabled = userSession?.user.twoFactorEnabled;
          return (
            <div className="flex items-center justify-end">
              <div className={twoFactorEnabled ? "block" : "hidden"}>
                <DisableTwoFactor />
              </div>

              <div className={twoFactorEnabled ? "hidden" : "block"}>
                <SetupTwoFactor />
              </div>
            </div>
          );
        },
      },
      {
        icon: KeyIcon,
        label: "Passkeys & security keys",
        value: "passkey",
        content: isLoading ? <Skeleton className="w-30 h-5" /> : (
          t(passkeyCount > 0 ? "{{count}} passkeys" : "No passkey setup", {
            count: passkeyCount,
          })
        ),
        right: () => {
          return (
            <Button
              size="sm"
              onClick={async () => {
                try {
                  const passkeyName = app?.name ?? "no name";
                  const { data: passkeyData, error } = await authClient.passkey
                    .addPasskey({
                      name: passkeyName,
                      authenticatorAttachment: "cross-platform",
                    });

                  if (!error) {
                    const { error } = await authClient.passkey
                      .verifyRegistration({
                        name: passkeyName,
                        response: passkeyData,
                      });

                    if (error) throw error;

                    mutate();
                  } else throw error;
                } catch (error) {
                  toast.error((error as Error).message);
                }
              }}
            >
              {t(passkeyCount > 0 ? "Add new" : "Setup")}
            </Button>
          );
        },
      },
      {
        icon: AsteriskSquareIcon,
        label: "Reset Password",
        value: "resetPassword",
        content: t("Last changed {{date}}", {
          date: "Sept 13, 2023",
        }),
        onClick: async () => {
          if (userSession?.user.email) {
            setLoading(true);
            const { data, error } = await authClient.requestPasswordReset({
              email: userSession.user.email,
              redirectTo: window.location.origin +
                "/change-password" +
                window.location.search,
            });

            setLoading(false);

            if (error) {
              toast.error(error.message);
              return;
            }

            toast.success(t(data.message));
          }
        },
      },
      // {
      //   icon: MonitorSmartphone,
      //   label: "Device Sessions",
      //   value: "deviceSessions",
      //   content: "3 sessions",
      //   onClick: async () => {},
      // },
    ],
    [t, isLoading, app, mutate, passkeyCount, userSession, setLoading],
  );

  return (
    <div className="flex flex-col gap-5 items-start w-full h-full px-3 max-w-lg mx-auto">
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-medium">{t("Security & sign-in")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Add an extra layer of security on your account")}
        </p>
      </div>
      {/* list */}
      <div className="flex flex-col gap-1 w-full">
        {SecurityMethods.map((item, index) => (
          <Item
            key={index}
            onClick={item.onClick}
            className={item.onClick ? "cursor-pointer" : ""}
          >
            <div className="flex items-center gap-3">
              <item.icon />
              <div className="flex flex-col">
                <h3 className="font-medium">{t(item.label)}</h3>
                {typeof item.content === "string"
                  ? (
                    <p className="text-sm text-muted-foreground">
                      {item.content}
                    </p>
                  )
                  : (
                    item.content
                  )}
              </div>
            </div>

            {item.right?.()}
          </Item>
        ))}
      </div>

      {/* multi sessions */}
      <DeviceSessions />
    </div>
  );
}
export default Security;
