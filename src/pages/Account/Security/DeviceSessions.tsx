import Item from "@/components/Item";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import type { TDeviceInfo } from "@/typings";
import { MonitorSmartphone } from "lucide-react";
import React from "react";
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
    async () => await authClient.listSessions(),
  );

  const deviceSessions = React.useMemo(() => data?.data ?? [], [data?.data]);

  const sessions = React.useMemo(() => {
    return (deviceSessions ?? []).reduce<Record<string, typeof deviceSessions>>(
      (acc, session) => {
        const { os, deviceType } = parseUserAgent(session.userAgent ?? "");

        const key = `${os}-${deviceType}`;

        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(session);

        return acc;
      },
      {},
    );
  }, [deviceSessions]);

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

      <div className="flex flex-col gap-1 grow w-full h-full">
        {deviceSessions.length === 0 ? (
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
          <Accordion>
            {Object.entries(sessions).map(([key, allSessions], idx) => {
              const [os, deviceType] = key.split("-");

              return (
                <AccordionItem
                  key={idx}
                  value={key}
                  className="group border-b-0!"
                >
                  <AccordionTrigger
                    render={(props) => (
                      <button
                        {...props}
                        className="cursor-pointer p-3 flex items-center justify-between gap-3 bg-background backdrop-blur-sm border/90 w-full group/accordion-trigger transition-all rounded-xs! group-first:rounded-t-lg! group-last:rounded-b-lg! mb-1"
                      ></button>
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {deviceType === "mobile" && "📱"}
                        {deviceType === "tablet" && "📲"}
                        {deviceType === "desktop" && "💻"}
                      </div>
                      <div className="flex flex-col items-start">
                        <h3>
                          {t("{{count}} session on {{device}}", {
                            count: allSessions.length,
                            device: ["mobile", "tablet"].includes(deviceType)
                              ? "phone"
                              : "computer",
                          })}
                        </h3>
                        <p>{os}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1!">
                    {allSessions.map((session) => {
                      const { deviceType, os, browser } = parseUserAgent(
                        session.userAgent ?? "",
                      );

                      const device = (
                        session as typeof session & {
                          device: TDeviceInfo;
                        }
                      ).device;

                      const isActive =
                        currentSession?.session.token === session.token;

                      return (
                        <Item
                          key={session.id}
                          className="rounded-xs! group-last:rounded-lg!"
                        >
                          <div className="flex items-center gap-3 justify-start w-full">
                            {/* left side */}
                            <div className="flex flex-col">
                              <h3 className="font-medium capitalize">
                                {`${device?.model || os} • ${device?.platform || browser} ${device?.platformVersion ?? ""}`}
                              </h3>

                              <p className="text-sm text-muted-foreground capitalize">
                                {device
                                  ? device.mobile
                                    ? "mobile"
                                    : "desktop"
                                  : deviceType}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => {
                              ActionSheetRef.current?.trigger(
                                "confirmation",
                                true,
                                {
                                  type: "normal",
                                  onConfirm: async (dismiss) => {
                                    setLoading(true);

                                    const { error } =
                                      await authClient.multiSession
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
                                },
                              );
                            }}
                          >
                            {t("Revoke")}
                          </Button>
                        </Item>
                      );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}

        <div className="h-50"></div>
      </div>
    </>
  );
}
