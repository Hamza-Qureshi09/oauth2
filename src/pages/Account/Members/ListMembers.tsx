import VirtualList from "@/components/VirutalList";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { ThunderSDK } from "thunder-sdk";
import { Trash2Icon } from "lucide-react";
import Item from "@/components/Item";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRepeater } from "@/components/SkeletonRepeater";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useSearchParams } from "react-router";
import { useLoading } from "@/contexts/Loading";
import { authClient } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyPolicies } from "@/hooks/useMyPolicies";
import { EmptyList } from "@/components/EmptyList";

export function ListMembers() {
  const { t } = useTranslation();
  const { setLoading } = useLoading();
  const { data: userSession } = authClient.useSession();

  const [searchParams] = useSearchParams();
  const tenantId = searchParams.get("tenant");

  const { myPolicies, isLoading } = useMyPolicies();

  const {
    data,
    isLoading: loadingMembers,
    isValidating,
    mutate,
  } = useSWR("tenantMembers.get", async () => {
    if (tenantId)
      return await ThunderSDK.tenantMembers.get({
        params: {},
        query: {},
        axiosConfig: {
          headers: {
            "X-TENANT-ID": tenantId,
          },
        },
      });
    else return null;
  });
  const members = data?.results ?? [];

  return (
    <>
      {loadingMembers || isValidating ? (
        <SkeletonRepeater count={3} className="max-w-lg mx-auto px-3">
          <MembersCardSkeleton />
        </SkeletonRepeater>
      ) : members.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia className="w-full">
              <EmptyList />
            </EmptyMedia>
            <EmptyTitle>{t("No Members!")}</EmptyTitle>
            <EmptyDescription>
              {t(
                `You haven"t created any tenant members yet. Get started by  creating your first tenant member.`,
              )}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <VirtualList
          className="h-[calc(100svh-212px)]"
          config={{
            count: members.length,
            paddingEnd: 500,
            estimateSize: () => 72,
          }}
        >
          {(virtualizer, items) =>
            items.map((virtualRow, idx) => {
              const item = members[virtualRow.index];
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
                        <AvatarImage alt={"accepted-member"} />
                        <AvatarFallback>
                          {getInitials(item.email ?? "")}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium ">{t("Email")}</h3>
                        {item.isOwner ? (
                          <Badge variant={"warning"}>{t("Owner")}</Badge>
                        ) : (
                          item.role && (
                            <Badge
                              variant={"outline"}
                              className="capitalize max-w-fit"
                            >
                              {t(item.role)}
                            </Badge>
                          )
                        )}
                      </div>
                      <div className="flex flex-row gap-1">
                        <p className="text-sm text-muted-foreground line-clamp-1 break-all">
                          {item.email ?? t("You")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end gap-3">
                    <Select
                      id="role"
                      value={item.role ?? ""}
                      onValueChange={async (role) => {
                        if (role === item.role) return;
                        setLoading(true);
                        const { status } = await ThunderSDK.tenantMembers
                          .update({
                            params: { id: item._id },
                            body: { role: role! },
                            axiosConfig: {
                              headers: {
                                "X-TENANT-ID": tenantId,
                              },
                            },
                          })
                          .raw.finally(() => setLoading(false));
                        if (status > 200 || status < 400) mutate(data);
                      }}
                      disabled={
                        userSession?.user.id !== item.createdBy ||
                        item.isOwner === true ||
                        isLoading
                      }
                    >
                      <SelectTrigger size={"xs"} className={"min-w-0"}>
                        <SelectValue
                          placeholder={t("Select role")}
                          className="capitalize"
                        />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          {myPolicies?.subRoles?.map((role, idx) => (
                            <SelectItem
                              key={idx}
                              value={role}
                              className="capitalize"
                            >
                              {role}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {item.user !== userSession?.user.id && (
                      <Button
                        variant="destructive-outline"
                        size="icon-sm"
                        disabled={
                          userSession?.user.id !== item.createdBy ||
                          item.isOwner === true
                        }
                        onClick={async () => {
                          const el = document.querySelector(
                            `[data-index="${item._id}"]`,
                          );

                          try {
                            setLoading(true);
                            el?.classList.add("opacity-30");

                            await ThunderSDK.tenantMembers.del({
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

                            members.filter((v) => v._id !== item._id);

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
                    )}
                  </div>
                </Item>
              );
            })
          }
        </VirtualList>
      )}
    </>
  );
}

function MembersCardSkeleton() {
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
