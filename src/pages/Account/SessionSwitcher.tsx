import { SheetPanel } from "../../components/ui/sheet";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { LogOut, UserPlus } from "lucide-react";
import Item from "../../components/Item";
import { Badge } from "../../components/ui/badge";
import { authClient } from "@/lib/auth";
import useSWR from "swr";
import { useLoading } from "@/contexts/Loading";
import { ButtonGroup } from "../../components/ui/group";
import { toast } from "sonner";
import { ActionSheetRef } from "@/registry/ActionSheet";
import { Skeleton } from "../../components/ui/skeleton";
import { SkeletonRepeater } from "../../components/SkeletonRepeater";

export const SessionSwitcher = () => {
  const { t } = useTranslation();
  const { isLoading, setLoading } = useLoading();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const { data: deviceSessions, isValidating } = useSWR(
    "listDeviceSessions",
    async () => await authClient.multiSession.listDeviceSessions(),
    { revalidateOnFocus: true },
  );

  const handleSwitch = async (token: string) => {
    setLoading(true);
    const { error } = await authClient.multiSession
      .setActive({
        sessionToken: token,
      })
      .finally(() => setLoading(false));

    if (error) {
      toast.error(error.message);
      return;
    }
  };

  return (
    <SheetPanel className="flex flex-col gap-3 h-full">
      <div className="flex flex-col justify-center items-center">
        <Avatar className="size-16 border mb-2">
          <AvatarImage src={user?.image ?? undefined} />
          <AvatarFallback className="text-xl bg-violet-500 text-foreground">
            {user?.name ?? "Unnamed"}
          </AvatarFallback>
        </Avatar>
        <p className="text-sm font-medium leading-tight">{user?.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
      </div>

      {/* session list */}
      <div className="flex flex-col gap-1 w-full">
        {isValidating || !deviceSessions?.data ? (
          <SkeletonRepeater count={3}>
            <MultiSessionCardSkeleton />
          </SkeletonRepeater>
        ) : (
          (deviceSessions?.data ?? []).map(({ session: s, user: u }) => {
            const isActive = s.token === session?.session.token;

            return (
              <Item
                key={s.token}
                data-index={s.token}
                className={"cursor-pointer"}
                onClick={() => {
                  if (!isActive && !isLoading) {
                    const el = document.querySelector(
                      `[data-index="${s.token}"]`,
                    );

                    el?.classList.toggle("opacity-30");
                    handleSwitch(s.token).finally(() =>
                      el?.classList.toggle("opacity-30"),
                    );
                  }
                }}
              >
                <div className="relative shrink-0">
                  <Avatar className="size-9 border">
                    <AvatarImage src={u.image ?? undefined} />
                    <AvatarFallback
                      className={"text-foreground text-xs font-medium"}
                    >
                      {u.name}
                    </AvatarFallback>
                  </Avatar>
                  {isActive && (
                    <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 border-2 border-background" />
                  )}
                </div>

                <div className="flex flex-col min-w-0 grow">
                  <p className="text-sm font-medium leading-tight truncate">
                    {u.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {u.email}
                  </p>
                </div>

                {isActive && (
                  <Badge variant="success" className="shrink-0 text-xs">
                    Active
                  </Badge>
                )}
              </Item>
            );
          })
        )}
      </div>

      {/* btns */}
      <div className="w-full flex flex-col grow">
        <ButtonGroup className="flex-1 grow w-full">
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              window.open(
                "/login" + `/?token=${session?.session.token}`,
                "_blank",
              );
            }}
            className="w-1/2"
            disabled={isLoading}
          >
            <UserPlus className="size-4" />
            {t("Add account")}
          </Button>

          <Button
            size="lg"
            variant="destructive-outline"
            onClick={async () => {
              setLoading(true);
              ActionSheetRef.current?.trigger("sessionSwitcher", false);
              await authClient.signOut().finally(() => setLoading(false));
            }}
            className="w-1/2"
            disabled={isLoading}
          >
            <LogOut className="size-4" />
            {t("Sign out all")}
          </Button>
        </ButtonGroup>
      </div>
    </SheetPanel>
  );
};

function MultiSessionCardSkeleton() {
  return (
    <Item>
      <Skeleton className="size-10 min-w-10 rounded-full" />
      <div className="flex flex-1 flex-col">
        <Skeleton className="my-0.5 h-4 max-w-30" />
        <Skeleton className="h-4 max-w-20" />
      </div>
      <Skeleton className="h-7 w-14" />
    </Item>
  );
}
