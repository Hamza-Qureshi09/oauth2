export function EmptyList() {
  return (
    <div className="flex h-full w-full items-center justify-center gap-3 mask-y-from-85%">
      <div className="relative flex h-60 max-w-fit items-center justify-center">
        <div className="flex h-full flex-col items-center justify-around">
          <div className="h-5 w-5 rounded-full border-2 border-background bg-border dark:bg-muted"></div>
          <div className="h-5 w-5 rounded-full border-2 border-background bg-border dark:bg-muted"></div>
          <div className="h-5 w-5 rounded-full border-2 border-background bg-border dark:bg-muted"></div>
        </div>

        <div className="absolute top-0 right-0 bottom-0 left-0 -z-1 mx-auto h-full w-0.5 bg-border/80"></div>
      </div>
      <div className="flex w-full max-w-50 flex-col gap-2">
        <div className="flex items-center gap-3 rounded-xl p-2 shadow-lg bg-card">
          <div className="h-14 min-h-14 w-14 min-w-14 rounded-xl bg-border/80"></div>

          <div className="h-3 w-full rounded-xl bg-border/80"></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl p-2 shadow-lg bg-card">
          <div className="h-14 min-h-14 w-14 min-w-14 rounded-xl bg-border/80"></div>

          <div className="h-3 w-full rounded-xl bg-border/80"></div>
        </div>
        <div className="flex items-center gap-3 rounded-xl p-2 shadow-lg bg-card">
          <div className="h-14 min-h-14 w-14 min-w-14 rounded-xl bg-border/80"></div>

          <div className="h-3 w-full rounded-xl bg-border/80"></div>
        </div>
      </div>
    </div>
  );
}
