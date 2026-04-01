import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { ThunderSDK } from "thunder-sdk";
import CreateClient from "./CreateClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import Item from "@/components/Item";
import { SquarePenIcon, Trash2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Group, GroupSeparator } from "@/components/ui/group";
import { Button } from "@/components/ui/button";
import CopyToClipboard from "@/components/CopyToClipboard";
import { SkeletonRepeater } from "@/components/SkeletonRepeater";
import { Skeleton } from "@/components/ui/skeleton";
import VirtualList from "@/components/VirutalList";
import { useLoading } from "@/contexts/Loading";

function OAuth() {
  const { t } = useTranslation();

  const { setLoading } = useLoading();

  const {
    data,
    isLoading: loadingClients,
    isValidating,
    error,
    mutate,
  } = useSWR(
    "oauth2Clients",
    async () =>
      await ThunderSDK.oauthClients.get({
        params: {},
      }),
  );

  const authClients = data?.results ?? [];

  console.log(error, loadingClients);

  return (
    <div className="flex flex-col gap-5 items-start w-full h-full">
      <div className="flex items-center justify-between gap-3 w-full sticky top-0 z-10 max-w-lg mx-auto px-3">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-medium">{t("OAuth2")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("Manage your oauth2 clients")}
          </p>
        </div>

        <CreateClient onSuccess={mutate} />
      </div>

      {loadingClients || isValidating || authClients.length === 0 ? (
        <SkeletonRepeater count={3} className="max-w-lg mx-auto px-3">
          <OAuthClientCardSkeleton />
        </SkeletonRepeater>
      ) : (
        <VirtualList
          config={{
            count: authClients.length,
            paddingEnd: 100,
            estimateSize: () => 72,
          }}
        >
          {(virtualizer, items) =>
            items.map((virtualRow) => {
              const item = authClients[virtualRow.index];
              if (!item) return;

              return (
                <Item
                  key={item._id}
                  ref={virtualizer.measureElement}
                  data-index={item._id}
                  className={"item-start transition-all ease-in-out"}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="size-10 border">
                        <AvatarImage
                          src={"https://google.com"}
                          alt={item.name}
                        />
                        <AvatarFallback>
                          {getInitials(item.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <h3 className="capitalize font-medium line-clamp-1">
                          {item.name}
                        </h3>
                        <Badge
                          variant={
                            item.type === "confidential" ? "warning" : "info"
                          }
                          className="capitalize max-w-fit"
                        >
                          {t(item.type)}
                        </Badge>
                      </div>
                      <CopyToClipboard text={item._id} />
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-3">
                    <Group aria-label="Client actions">
                      <CreateClient
                        data={item}
                        render={
                          <Button variant="outline" size="icon-sm">
                            <SquarePenIcon />
                          </Button>
                        }
                        onSuccess={mutate}
                      />
                      <GroupSeparator />
                      <Button
                        variant="destructive-outline"
                        size="icon-sm"
                        onClick={async () => {
                          const el = document.querySelector(
                            `[data-index="${item._id}"]`,
                          );

                          try {
                            setLoading(true);
                            el?.classList.add("opacity-30");

                            await ThunderSDK.oauthClients.del({
                              params: { id: item._id },
                            });

                            el?.classList.add(
                              "animate-out",
                              "fade-out",
                              "slide-out-to-right-70",
                              "duration-500",
                            );

                            authClients.filter((v) => v._id !== item._id);

                            setTimeout(() => mutate(), 400);
                          } catch (error) {
                            console.log("error", error);
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        <Trash2Icon />
                      </Button>
                    </Group>
                  </div>
                </Item>
              );
            })
          }
        </VirtualList>
      )}
    </div>
  );
}
export default OAuth;

function OAuthClientCardSkeleton() {
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
