import React, { Suspense } from "react";
import { SheetHeader, SheetPanel, SheetTitle } from "./ui/sheet";
import { useTranslation } from "react-i18next";
import type { authClient } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Loader2, LogIn, LogOut, UserPlus } from "lucide-react";
import Item from "./Item";
import { Badge } from "./ui/badge";
import { ActionSheetRef } from "@/registry/ActionSheet";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
];

type Session = typeof authClient.$Infer.Session;
export type SessionsPromise = Promise<{
  data: Session[] | null;
  error: unknown;
}>;

export type SessionSwitcherParams = {
  activeToken?: string;
  activeUser?: { name: string; email: string; image?: string | null };
  sessionsPromise: SessionsPromise;
  onSwitch: (token: string) => Promise<void>;
  onAddAccount: () => void;
  onManage: () => void;
  onSignOut: () => void;
};

const dismiss = () =>
  ActionSheetRef.current?.trigger(
    "sessionSwitcher",
    false,
    {} as SessionSwitcherParams,
  );

export const SessionSwitcher = ({
  activeToken,
  activeUser,
  sessionsPromise,
  onSwitch,
  onAddAccount,
  onManage,
  onSignOut,
}: SessionSwitcherParams) => {
  const { t } = useTranslation();

  const handleAddAccount = () => {
    dismiss();
    onAddAccount();
  };

  const handleManage = () => {
    dismiss();
    onManage();
  };

  const handleSignOut = () => {
    dismiss();
    onSignOut();
  };
  return (
    <>
      <SheetHeader>
        <SheetTitle>{t("Your accounts")}</SheetTitle>
      </SheetHeader>

      <SheetPanel className="h-full">
        <div className="flex flex-col justify-center items-center px-6 py-4">
          <Avatar className="size-16 border mb-2">
            <AvatarImage src={activeUser?.image ?? undefined} />
            <AvatarFallback className="text-xl bg-violet-500 text-foreground">
              {activeUser?.name ?? ""}
            </AvatarFallback>
          </Avatar>
          <p className="text-sm font-medium leading-tight">
            {activeUser?.name}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeUser?.email}
          </p>
          <Button
            variant="outline"
            size="xs"
            className="mt-3 rounded-full h-8 text-xs px-4"
            onClick={handleManage}
          >
            {t("Manage your account")}
          </Button>
        </div>
        <div className="border-t" />

        {/* session list */}
        <div className="grow overflow-y-auto pb-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <SessionList
              activeToken={activeToken}
              sessionsPromise={sessionsPromise}
              onSwitch={onSwitch}
            />
          </Suspense>
        </div>

        {/* btns */}
        <div className="w-full flex flex-col gap-1.5">
          <Button
            variant="outline"
            onClick={handleAddAccount}
            className="py-5!"
          >
            <span className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <UserPlus className="size-4" />
            </span>
            {t("Add another account")}
          </Button>

          <Button
            variant="destructive-outline"
            onClick={handleSignOut}
            className="py-5!"
          >
            <span className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
              <LogOut className="size-4" />
            </span>
            {t("Sign out of all accounts")}
          </Button>
        </div>
      </SheetPanel>
    </>
  );
};

function SessionList({
  activeToken,
  sessionsPromise,
  onSwitch,
}: Pick<
  SessionSwitcherParams,
  "activeToken" | "sessionsPromise" | "onSwitch"
>) {
  const { data, error } = React.use(sessionsPromise);
  const [isPending, startTransition] = React.useTransition();
  const [switchingToken, setSwitchingToken] = React.useState<string | null>(
    null,
  );

  if (error)
    return (
      <p className="text-sm text-destructive text-center py-3 px-4">
        {(error as { message: string })?.message ?? "Failed to load sessions"}
      </p>
    );

  const sessions = data ?? [];

  const handleSwitch = (token: string) => {
    setSwitchingToken(token);
    startTransition(async () => {
      try {
        await onSwitch(token);
        dismiss();
      } catch {
        toast.error("Failed to switch session");
      } finally {
        setSwitchingToken(null);
      }
    });
  };

  return (
    <div className="flex flex-col py-1">
      {sessions.map((s, i) => {
        const isActive = s.session.token === activeToken;
        const isSwitching = switchingToken === s.session.token;
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];

        return (
          <Item
            key={s.session.token}
            className={cn(isActive && "pointer-events-none")}
            onClick={() => !isActive && handleSwitch(s.session.token)}
          >
            <div className="relative shrink-0">
              <Avatar className="size-9 border">
                <AvatarImage src={s.user.image ?? undefined} />
                <AvatarFallback
                  className={cn("text-foreground text-xs font-medium", color)}
                >
                  {s.user.name}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>

            <div className="flex flex-col min-w-0 grow">
              <p className="text-sm font-medium leading-tight truncate">
                {s.user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {s.user.email}
              </p>
            </div>

            {isActive ? (
              <Badge variant="secondary" className="shrink-0 text-xs">
                Active
              </Badge>
            ) : (
              <Button
                size="xs"
                disabled={isPending}
                className="shrink-0 h-7 px-2 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSwitch(s.session.token);
                }}
              >
                {isSwitching ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <>
                    <LogIn className="size-3 mr-1" />
                    Switch
                  </>
                )}
              </Button>
            )}
          </Item>
        );
      })}
    </div>
  );
}
