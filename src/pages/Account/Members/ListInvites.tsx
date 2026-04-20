import Item from "@/components/Item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import VirtualList from "@/components/VirutalList";
import { useLoading } from "@/contexts/Loading";
import { getInitials } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ThunderSDK } from "thunder-sdk";
import useSWR from "swr";
import { Trash2Icon } from "lucide-react";
import { Group } from "@/components/ui/group";
import { CreateInvite } from "./CreateInvite";
import { Badge } from "@/components/ui/badge";
import { SkeletonRepeater } from "@/components/SkeletonRepeater";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import CopyToClipboard from "@/components/CopyToClipboard";
import { useSearchParams } from "react-router";
import { EmptyList } from "@/components/EmptyList";

export function ListInvites() {
  const { t } = useTranslation();
  const { setLoading } = useLoading();

  const [searchParams] = useSearchParams();

  const tenantId = searchParams.get("tenant");

  const { data, isLoading, mutate, isValidating } = useSWR(
    "tenantInvites.get",
    async () => {
      if (tenantId)
        return await ThunderSDK.tenantInvites.get({
          params: {},
          query: {},
          axiosConfig: {
            headers: {
              "X-TENANT-ID": tenantId,
            },
          },
        });
      else return null;
    },
  );

  const TenantInvites = data?.results ?? [];

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* invite form  */}
      <CreateInvite onSuccess={mutate} />

      {isLoading || isValidating ? (
        <SkeletonRepeater count={3} className="max-w-lg mx-auto px-3">
          <TenantInviteCardSkeleton />
        </SkeletonRepeater>
      ) : TenantInvites.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia className="w-full">
              <EmptyList />
            </EmptyMedia>
            <EmptyTitle>{t("No Invites!")}</EmptyTitle>
            <EmptyDescription>
              {t(`You haven"t created any invite yet. Get started by creating
              your first invite by typing email & select role.`)}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <VirtualList
          className="h-[calc(100svh-340px)]"
          config={{
            count: TenantInvites.length,
            paddingEnd: 500,
            estimateSize: () => 72,
          }}
        >
          {(virtualizer, items) =>
            items.map((virtualRow, idx) => {
              const item = TenantInvites[virtualRow.index];
              if (!item)
                return (
                  <div key={idx + idx.toString()} className="py-10 bg-blue-300">
                    {virtualRow.index}
                  </div>
                );

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
                        <AvatarImage alt={"pending-member-invite"} />
                        <AvatarFallback>
                          {getInitials(item.email ?? "")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-row items-center gap-1.5">
                        <h3 className="font-medium ">{t("Email")}</h3>
                        <CopyToClipboard
                          text={new URL(
                            `invite/${item._id}`,
                            window.location.origin,
                          ).toString()}
                          label="Invite Link"
                        />
                      </div>
                      <div className="flex flex-row gap-1">
                        <p className="text-sm text-muted-foreground">
                          {item.email}
                        </p>
                        <Badge
                          variant={"info"}
                          className="capitalize max-w-fit"
                        >
                          {t(item.role)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-3">
                    <Group aria-label="Tenant actions">
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

                            await ThunderSDK.tenantInvites.del({
                              params: { id: item._id },
                              axiosConfig: {
                                headers: {
                                  "X-TENANT-ID": tenantId,
                                },
                              },
                            });

                            el?.classList.add(
                              "animate-out",
                              "fade-out",
                              "slide-out-to-right-70",
                              "duration-500",
                            );

                            TenantInvites.filter((v) => v._id !== item._id);

                            setTimeout(() => mutate(), 400);
                          } catch (error) {
                            console.error("error", error);
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

function TenantInviteCardSkeleton() {
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
