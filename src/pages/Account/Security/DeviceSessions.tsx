import OAuth2 from "@/components/custom-icons/oauth2";
import Item from "@/components/Item";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { useCapabilities } from "@/hooks/useCapabilities";
import { authClient } from "@/lib/auth";
import { parseUserAgent } from "@/lib/utils";
import { MonitorSmartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import useSWR from "swr";

export function DeviceSessions() {
    const { t } = useTranslation();
    const { capabilities } = useCapabilities();

    const {
        data,
        isLoading: loadingSessions,
        isValidating,
    } = useSWR(
        "oauth2Clients",
        async () => await authClient.multiSession.listDeviceSessions(),
    );

    const sessions = data?.data ?? [];

    console.info({ data, loadingSessions, isValidating, capabilities });

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
                {sessions.length === 0
                    ? (
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
                    )
                    : (
                        sessions.map(({ session }, idx) => {
                            console.info(
                                parseUserAgent(session.userAgent!),
                                "user agent",
                            );
                            return (
                                <Item
                                    key={idx}
                                >
                                    <div className="flex items-center gap-3">
                                        {}
                                        <div className="flex flex-col">
                                            <h3 className="font-medium">
                                                {session.userAgent}
                                            </h3>
                                        </div>
                                    </div>
                                </Item>
                            );
                        })
                    )}
            </div>
        </>
    );
}
