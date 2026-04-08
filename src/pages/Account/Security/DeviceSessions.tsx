import Item from "@/components/Item";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useLoading } from "@/contexts/Loading";
import { useCapabilities } from "@/hooks/useCapabilities";
import { authClient } from "@/lib/auth";
import { parseUserAgent } from "@/lib/utils";
import { ActionSheetRef } from "@/registry/ActionSheet";
import { MonitorSmartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import useSWR from "swr";

export function DeviceSessions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const { capabilities } = useCapabilities();
  const { data: currentSession } = authClient.useSession();

  const { data } = useSWR(
    "deviceSessions",
    async () => await authClient.multiSession.listDeviceSessions(),
  );

  const sessions = data?.data ?? [];

  if (!capabilities?.includes("multiSession")) return null;

  return (
    <>
      {/* Device sessions */}
      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-medium">{t("Your Devices")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("Where you're signed-in")}
        </p>
      </div>

      <div className="flex flex-col gap-1 grow w-full">
        {sessions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MonitorSmartphone />
              </EmptyMedia>
              <EmptyTitle>No Sessions!</EmptyTitle>
              <EmptyDescription>
                We didn't found any device session yet!
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          sessions.map(({ session }, idx) => {
            const { deviceType, os, browser } = parseUserAgent(
              session.userAgent!,
            );
            const isActive = currentSession?.session.token === session.token;

            return (
              <Item key={idx}>
                <div className="flex items-center gap-3 justify-start w-full">
                  {/* left side */}
                  <div className="text-2xl">
                    {deviceType === "mobile" && "📱"}
                    {deviceType === "tablet" && "📲"}
                    {deviceType === "desktop" && "💻"}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-medium capitalize">
                      {os} • {browser}
                    </h3>

                    <p className="text-sm text-muted-foreground capitalize">
                      {deviceType} device
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => {
                    ActionSheetRef.current?.trigger("confirmation", true, {
                      type: "normal",
                      onConfirm: async (dismiss) => {
                        setLoading(true);

                        const { error } = await authClient.multiSession
                          .revoke({
                            sessionToken: session.token,
                          })
                          .finally(() => setLoading(false));

                        if (error) {
                          toast.error(error.message);
                          return;
                        }

                        dismiss();
                        if (isActive) navigate("/login");
                      },
                    });
                  }}
                >
                  {t("Revoke")}
                </Button>
              </Item>
            );
          })
        )}
      </div>
    </>
  );
}
