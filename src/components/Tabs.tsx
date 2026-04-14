import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const TabsContext = React.createContext<{
  defaultValue: string;
  onValueChange?: (value: string) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  scrollToActiveTab: (value: string) => void;
} | null>(null);

function useTabs() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Must be used inside Tabs");
  return ctx;
}

function Tabs({
  children,
  defaultValue,
  onValueChange,
}: React.HTMLAttributes<HTMLDivElement> & {
  defaultValue: string;
  onValueChange: (value: string) => void;
}) {
  const count = React.useRef(0);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToActiveTab = React.useCallback(
    (value: string) => {
      const contentEl = panelRef.current?.querySelector(
        `[data-value="${value}"]`,
      ) as HTMLElement;

      const triggerEl = listRef.current?.querySelector(
        `[data-value="${value}"]`,
      ) as HTMLElement;

      if (contentEl && triggerEl) {
        contentEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });

        triggerEl.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "start",
        });

        onValueChange?.(value);
      }
    },
    [panelRef, listRef, onValueChange],
  );

  React.useEffect(() => {
    if (count.current === 0) {
      scrollToActiveTab(defaultValue);
      count.current++;
    }
  }, [defaultValue, scrollToActiveTab]);

  const value = React.useMemo(
    () => ({
      defaultValue,
      onValueChange,
      scrollToActiveTab,
      listRef,
      panelRef,
    }),
    [defaultValue, onValueChange, listRef, panelRef, scrollToActiveTab],
  );

  return (
    <TabsContext.Provider value={value}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
            display: none;
        }

        .hide-scrollbar {
            overflow-x: auto;
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        `}</style>
      {children}
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  containerClassName = "max-w-fit mx-auto",
  variant = "default",
  children,
  right,
  ...props
}: {
  variant?: "default" | "filled";
  containerClassName?: string;
  right?: () => React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { listRef } = useTabs();

  return (
    <div className={cn("p-2", containerClassName)}>
      <div className="flex items-center gap-x-5 rounded-xl w-full">
        <div
          ref={listRef}
          className={cn(
            "relative flex p-1 gap-2 snap-x snap-mandatory overflow-x-auto hide-scrollbar rounded-md",
            className,
            variant === "filled" ? "bg-background" : "",
          )}
          role="tablist"
          {...props}
        >
          {children}
        </div>
        {right?.()}
      </div>
    </div>
  );
}

function TabButton({
  className,
  value,
  variant,
  ...props
}: React.ComponentProps<typeof Button> & { value: string }) {
  const { defaultValue, scrollToActiveTab } = useTabs();

  return (
    <Button
      size="lg"
      variant={defaultValue === value ? variant : "ghost"}
      className={cn(
        "snap-start flex shrink-0 grow cursor-pointer items-center justify-center whitespace-nowrap transition-[color,background-color,box-shadow]",
        className,
      )}
      data-value={value}
      data-slot="tabs-trigger"
      onClick={() => scrollToActiveTab(value)}
      role="tab"
      {...props}
    />
  );
}

function TabPanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { panelRef, onValueChange } = useTabs();

  return (
    <div
      ref={panelRef}
      className={cn(
        "flex snap-x snap-mandatory overflow-x-auto hide-scrollbar",
        className,
      )}
      data-slot="tabs-content"
      onScrollEnd={() => {
        const container = panelRef.current;
        if (container) {
          const index = Math.round(
            container.scrollLeft / container.clientWidth,
          );

          const currentSnap =
            container.children[index].getAttribute("data-value");
          onValueChange?.(currentSnap!);
        }
      }}
      {...props}
    />
  );
}

function TabContent({
  className,
  value,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <div
      id={value}
      data-value={value}
      className={cn("snap-start shrink-0 w-full", className)}
      data-slot="tabs-panel"
      role="tabpanel"
      {...props}
    />
  );
}

function TabBullets() {
  const { defaultValue, listRef } = useTabs();

  const [snapList, setSnapList] = React.useState<HTMLCollection>();

  React.useEffect(() => {
    if (!listRef.current) return;

    setSnapList(listRef.current.children);
  }, [listRef]);

  return (
    (snapList?.length ?? 0) > 0 && (
      <div className="fixed bottom-5 left-0 right-0 max-w-fit rounded-full bg-background/50 backdrop-blur-sm p-2 flex items-center justify-center gap-1 mx-auto">
        {Array.from(snapList!, (el, i) => {
          const dataValue = el.getAttribute("data-value");
          return (
            <span
              key={i}
              className={cn(
                "w-2 h-2 rounded-full",
                defaultValue === dataValue
                  ? "bg-primary"
                  : "bg-muted-foreground/30 backdrop-blur-sm",
              )}
            />
          );
        })}
      </div>
    )
  );
}

export { Tabs, TabsList, TabButton, TabPanel, TabContent, TabBullets };
