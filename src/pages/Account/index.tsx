/* eslint-disable react-hooks/immutability */
import { Navigate, Outlet } from "react-router";
import { authClient } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonRepeater } from "@/components/SkeletonRepeater";

function Account() {
  const { data, isPending } = authClient.useSession();

  if (data && !isPending) {
    const query = new URLSearchParams(window.location.search);

    if (query.has("client_id")) {
      window.location.href =
        new URL(
          "/oauth/authorize",
          import.meta.env.VITE_API_ORIGIN,
        ).toString() + window.location.search;

      return;
    } else if (query.has("redirect")) {
      window.location.href = query.get("redirect")!;
    }
  }

  if (!data && !isPending)
    return <Navigate to={"/login" + window.location.search} />;

  if (isPending) return <SkeletonLoading />;

  return <Outlet />;
}

export default Account;

function SkeletonLoading() {
  return (
    <div className="w-full bg-muted/5 dark:bg-muted/30 h-svh px-3">
      <div className="p-2">
        <div
          className={
            "relative flex p-2 gap-2 snap-x snap-mandatory max-w-fit mx-auto w-full overflow-hidden"
          }
          role="tablist"
        >
          <SkeletonRepeater count={6} className="gap-3 flex-row">
            <Skeleton className="w-24 h-10 snap-start flex shrink-0 grow cursor-pointer items-center justify-center whitespace-nowrap transition-[color,background-color,box-shadow]" />
          </SkeletonRepeater>
        </div>
      </div>

      <Skeleton className="w-full h-[calc(100%-12%)] max-w-2xl mx-auto" />

      <div className="fixed bottom-5 left-0 right-0 max-w-fit rounded-full bg-background/50 backdrop-blur-sm p-2 flex items-center justify-center gap-1 mx-auto">
        {Array.from({ length: 6 }, (_, i) => {
          return (
            <span
              key={i}
              className={
                "w-2 h-2 rounded-full bg-muted-foreground/30 backdrop-blur-sm"
              }
            />
          );
        })}
      </div>
    </div>
  );
}
