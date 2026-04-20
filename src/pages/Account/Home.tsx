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
import {
  formatDate,
  getInitials,
  handleUpload,
  transformImage,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Item from "@/components/Item";
import { Badge } from "@/components/ui/badge";
import OAuth2 from "@/components/custom-icons/oauth2";
import OAuth from "./Oauth";
import Security from "./Security";
import { toast } from "sonner";
import { useSearchParams } from "react-router";
import { useLoading } from "@/contexts/Loading";
import React from "react";
import UpdateProfile from "./UpdateProfile";
import { ActionSheetRef } from "@/registry/ActionSheet";
import { Members } from "./Members";
import { AvatarUpload } from "@/components/AvatarUpload";

const tabs = [
  { id: "home", icon: HomeIcon, label: "Home" },
  { id: "personal", icon: Contact2, label: "Personal info" },
  { id: "security", icon: Shield, label: "Security & Sign-in" },
  {
    id: "oauth2",
    icon: OAuth2,
    label: "OAuth2",
  },
];

function Home() {
  const { t } = useTranslation();
  const { setLoading } = useLoading();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data, refetch } = authClient.useSession();

  const fullName = data?.user?.name || "Unamed";
  const verified = data?.user?.emailVerified;
  const email = data?.user.email ?? "unknown";

  const defaultValue = React.useMemo(() => {
    const search = searchParams.get("tab") || "home";

    return search === "members" && !searchParams.get("tenant")
      ? "home"
      : search;
  }, [searchParams]);

  return (
    <div className="w-full h-full">
      <Tabs
        defaultValue={defaultValue}
        onValueChange={(tab) => {
          searchParams.set("tab", tab);
          setSearchParams(searchParams);
        }}
      >
        <TabsList
          className="w-full max-w-fit mx-auto"
          right={() => (
            <Avatar
              className={"size-10 border-3 border-primary/30 cursor-pointer"}
              onClick={() =>
                ActionSheetRef.current?.trigger("sessionSwitcher", true)
              }
            >
              <AvatarImage src={transformImage(data?.user.image)} />
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

        <TabPanel className="w-full h-[calc(100svh-60px)] pt-5">
          <TabContent value={"home"} className="h-max">
            <div className="flex flex-col gap-2 items-center justify-start pt-20 w-full max-w-lg mx-auto">
              <Avatar className={"size-36 border"}>
                <AvatarImage
                  src={transformImage(data?.user.image, {
                    width: 250,
                    height: 250,
                  })}
                />
                <AvatarFallback className="text-xl">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xl font-medium">{fullName}</h3>
              <p>{data?.user?.email}</p>

              <Button
                onClick={async () => {
                  setLoading(true);
                  const { error } = await authClient
                    .signOut()
                    .finally(() => setLoading(false));

                  if (error) {
                    toast.error(error.message);
                    return;
                  }
                }}
              >
                {t("Logout")}
              </Button>
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
                    right: () => {
                      const avatar = data?.user?.image;
                      return (
                        <div className="relative">
                          <AvatarUpload
                            id="avatar"
                            showCancel={false}
                            initialFile={
                              avatar
                                ? {
                                    id: avatar,
                                    type: "avatar",
                                    name: avatar,
                                    url: avatar,
                                    size: 0,
                                  }
                                : undefined
                            }
                            onUpload={async ({ file }, signal) => {
                              if (file instanceof File && data) {
                                setLoading(true);
                                const res = await handleUpload(file, {
                                  path: [data.user.id, "avatar"],
                                  signal,
                                }).finally(() => setLoading(false));

                                const { error } = await authClient.updateUser({
                                  image: res.url,
                                });

                                if (error) {
                                  toast.error(error.message);
                                  return;
                                }

                                refetch();
                              }
                            }}
                          />

                          <label
                            htmlFor="avatar"
                            className="absolute right-0 bottom-0"
                          >
                            <Button
                              size="icon-xs"
                              className="pointer-events-none cursor-pointer"
                            >
                              <ArrowUpFromLine />
                            </Button>
                          </label>
                        </div>
                      );
                    },
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
          <TabContent value={"members"}>
            <Members />
          </TabContent>
        </TabPanel>

        <TabBullets />
      </Tabs>
    </div>
  );
}
export default Home;
