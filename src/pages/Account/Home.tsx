import {
  ArrowUpFromLine,
  Calendar,
  CheckCircle2,
  Contact2,
  HomeIcon,
  ImageIcon,
  Mail,
  Shield,
  ShieldCheck,
  UserRound,
  Users2,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  TabBullets,
  TabButton,
  TabContent,
  TabPanel,
  Tabs,
  TabsList,
} from "@/components/Tabs";
import { authClient } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, getInitials, sha256 } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Item from "@/components/Item";
import { Badge } from "@/components/ui/badge";
import OAuth2 from "@/components/custom-icons/oauth2";
import OAuth from "./Oauth";
import Security from "./Security";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router";
import { useLoading } from "@/contexts/Loading";
import { GravatarQuickEditorCore } from "@gravatar-com/quick-editor";
import React from "react";
import UpdateProfile from "./UpdateProfile";
import { ActionSheetRef } from "@/registry/ActionSheet";
import type { SessionsPromise } from "@/components/SessionSwitcher";

const tabs = [
  { id: "home", icon: HomeIcon, label: "Home" },
  { id: "personal", icon: Contact2, label: "Personal info" },
  { id: "security", icon: Shield, label: "Security & Sign-in" },
  {
    id: "oauth2",
    icon: OAuth2,
    label: "OAuth2",
  },
  { id: "collaborators", icon: Users2, label: "Collaborators" },
];

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionsPromise, setSessionsPromise] = React.useState(
    () => authClient.multiSession.listDeviceSessions() as SessionsPromise,
  );

  const { setLoading } = useLoading();

  const { data, refetch } = authClient.useSession();

  const fullName = data?.user?.name || "Unamed";
  const verified = data?.user?.emailVerified;
  const email = data?.user.email ?? "unknown";

  const gravatarCore = React.useMemo(
    () =>
      new GravatarQuickEditorCore({
        email,
        scope: ["avatars"],
        onProfileUpdated: async (type) => {
          if (type === "avatar_updated") {
            const { error } = await authClient.updateUser({
              image: `https://www.gravatar.com/avatar/${await sha256(
                email,
              )}?s=200&d=identicon`,
            });

            if (error) {
              toast.error(error.message);
              return;
            }

            refetch();
          }
        },
      }),
    [email, refetch],
  );

  const signOutUser = async () => {
    setLoading(true);
    const { error } = await authClient
      .signOut()
      .finally(() => setLoading(false));

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate("/login");
  };

  const openSessionSwitcher = () => {
    ActionSheetRef.current?.trigger("sessionSwitcher", true, {
      activeToken: data?.session?.token,
      activeUser: data?.user,
      sessionsPromise,
      onSwitch: async (token: string) => {
        setLoading(true);
        await authClient.multiSession.setActive({ sessionToken: token });
        refetch();
        setSessionsPromise(
          () => authClient.multiSession.listDeviceSessions() as SessionsPromise,
        );
        setLoading(false);
      },
      onAddAccount: () => {
        // will do new account signup here
      },
      onManage: () => {
        // for now redirecting to profile page
        navigate("/account/#personal");
      },
      onSignOut: () => signOutUser(),
    });
  };

  return (
    <div className="w-full h-full bg-muted-foreground/5 dark:bg-muted/30">
      <Tabs
        defaultValue={location.hash.replaceAll("#", "") || "home"}
        onValueChange={(tab) =>
          navigate(location.pathname + `/#${tab}`, { replace: true })
        }
      >
        <TabsList
          className="w-full max-w-fit mx-auto"
          right={() => (
            <Avatar
              className={"size-10 border-3 border-primary/30 cursor-pointer"}
              onClick={openSessionSwitcher}
            >
              <AvatarImage src={data?.user?.image ?? undefined} />
              <AvatarFallback className="text-xl">
                {getInitials(fullName)}
              </AvatarFallback>
            </Avatar>
          )}
        >
          {tabs.map((tab) => (
            <TabButton key={tab.id} value={tab.id}>
              <tab.icon /> {tab.label}
            </TabButton>
          ))}
        </TabsList>

        <TabPanel className="w-full h-[calc(100svh-68px)] pt-10">
          <TabContent value={"home"} className="h-max">
            <div className="flex flex-col gap-2 items-center justify-start pt-20 w-full max-w-lg mx-auto">
              <Avatar className={"size-36 border"}>
                <AvatarImage src={data?.user?.image ?? undefined} />
                <AvatarFallback className="text-xl">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xl font-medium">{fullName}</h3>
              <p>{data?.user?.email}</p>

              <Button onClick={async () => signOutUser()}>{t("Logout")}</Button>
            </div>
          </TabContent>
          <TabContent value={"personal"}>
            <div className="flex flex-col gap-5 items-start w-full h-full px-3 max-w-lg mx-auto">
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-medium">{t("Personal info")}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t("Manage details that make App work better for you")}
                  </p>
                </div>

                <UpdateProfile />
              </div>

              {/* list */}
              <div className="flex flex-col gap-1 grow w-full">
                {[
                  {
                    icon: ImageIcon,
                    label: "Profile picture",
                    right: () => (
                      <div className="relative">
                        <Avatar className="size-14 border">
                          <AvatarImage src={data?.user?.image ?? undefined} />
                          <AvatarFallback className="text-xl">
                            {getInitials(fullName)}
                          </AvatarFallback>
                        </Avatar>

                        <Button
                          size="icon-xs"
                          className="absolute right-0 bottom-0"
                          onClick={() => gravatarCore.open()}
                        >
                          <ArrowUpFromLine />
                        </Button>
                      </div>
                    ),
                  },
                  {
                    icon: Contact2,
                    label: "Name",
                    content: fullName,
                  },
                  {
                    icon: UserRound,
                    label: "Gender",
                    content: data?.user.gender ?? "N/A",
                  },
                  {
                    icon: Calendar,
                    label: "Date of Birth",
                    content: formatDate(data?.user.dob, "PP"),
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    content: data?.user?.email,
                  },
                  {
                    icon: ShieldCheck,
                    label: "Email verified",
                    content: (
                      <Badge
                        variant={verified ? "success" : "destructive"}
                        className="max-w-fit"
                      >
                        {verified ? (
                          <CheckCircle2 className="fill-success stroke-background" />
                        ) : (
                          <XCircle className="fill-destructive stroke-background" />
                        )}
                        {t(verified ? "Verified" : "Unverified")}
                      </Badge>
                    ),
                    right: () =>
                      !verified && (
                        <Button
                          onClick={async () => {
                            setLoading(true);
                            await authClient
                              .sendVerificationEmail({
                                email,
                                callbackURL: window.location.origin,
                              })
                              .finally(() => setLoading(false));
                          }}
                        >
                          {t("Verify")}
                        </Button>
                      ),
                  },
                ].map((item, index) => (
                  <Item key={index}>
                    <div className="flex items-center gap-3">
                      <item.icon />
                      <div className="flex flex-col">
                        <h3 className="font-medium">{t(item.label)}</h3>
                        {typeof item.content === "string" ? (
                          <p className="text-sm text-muted-foreground">
                            {item.content}
                          </p>
                        ) : (
                          item?.content
                        )}
                      </div>
                    </div>

                    {item.right?.()}
                  </Item>
                ))}
              </div>
            </div>
          </TabContent>
          <TabContent value={"security"}>
            <Security />
          </TabContent>
          <TabContent value={"oauth2"}>
            <OAuth />
          </TabContent>
          <TabContent value={"collaborators"}>Collaborators</TabContent>
        </TabPanel>

        <TabBullets />
      </Tabs>
    </div>
  );
}
export default Home;
