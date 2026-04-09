import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const TabsContext = React.createContext<{
  defaultValue: string;
  onValueChange?: (value: string) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  panelRef: React.RefObject<HTMLDivElement | null>;
  scrollToValue: (id: string) => void;
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
  const isManualScrolling = React.useRef(false);
  const listRef = React.useRef<HTMLDivElement | null>(null);
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  const scrollToActiveTab = React.useCallback((targetValue: string) => {
    const listEl = listRef.current;

    const triggerEl = listEl?.querySelector(
      `[data-value="${targetValue}"]`,
    ) as HTMLElement;

    if (triggerEl) {
      triggerEl.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, []);

  const scrollToValue = React.useCallback(
    (id: string) => {
      isManualScrolling.current = true;
      const panelEl = panelRef.current;
      const contentEl = panelRef.current?.querySelector(
        `[data-value="${id}"]`,
      ) as HTMLElement;

      if (panelEl && contentEl) {
        const left = contentEl.offsetLeft;
        panelEl.scrollTo({ left, behavior: "smooth" });
      }

      onValueChange?.(id);

      // Pass the id to scrollToActiveTab so it finds the correct tab
      scrollToActiveTab(id);

      setTimeout(() => {
        isManualScrolling.current = false;
      }, 600);
    },
    [scrollToActiveTab],
  );

  React.useEffect(() => {
    scrollToValue(defaultValue);
  }, [scrollToValue, defaultValue]);

  //   React.useEffect(() => {
  //     const snapItems = panelRef.current?.querySelectorAll("[data-value]");
  //     // Options for the Intersection Observer
  //     // threshold: 0.5 means the callback fires when 50% of the item is visible
  //     // root: container is the scrollable area
  //     const options = {
  //       root: panelRef.current,
  //       rootMargin: "0px",
  //       threshold: 0.5,
  //     };

  //     // Callback function when an item intersects the view
  //     const observerCallback = (entries: IntersectionObserverEntry[]) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           if (isManualScrolling.current) return;
  //           // An item is now intersecting enough to be considered active
  //           const activeId = entry.target.getAttribute("data-value");
  //           if (activeId) {
  //             scrollToActiveTab(activeId);
  //             onValueChange(activeId);
  //           }
  //         }
  //       });
  //     };

  //     // Create the observer and observe all items
  //     const observer = new IntersectionObserver(observerCallback, options);
  //     snapItems?.forEach((item) => {
  //       observer.observe(item);
  //     });

  //     return () => observer.disconnect();
  //   }, [panelRef, onValueChange, scrollToValue, scrollToActiveTab]);

  const value = React.useMemo(
    () => ({
      defaultValue,
      onValueChange,
      scrollToValue,
      listRef,
      panelRef,
    }),
    [defaultValue, onValueChange, scrollToValue],
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
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { listRef } = useTabs();

  return (
    <div className="p-2">
      <div
        ref={listRef}
        className={cn(
          "relative flex p-2 gap-2 snap-x snap-mandatory overflow-x-auto hide-scrollbar",
          className,
        )}
        role="tablist"
        {...props}
      >
        {children}
      </div>
    </div>
  );
}

function TabButton({
  className,
  value,
  ...props
}: React.ComponentProps<typeof Button> & { value: string }) {
  const { defaultValue, scrollToValue } = useTabs();

  return (
    <Button
      size="lg"
      variant={defaultValue === value ? "default" : "ghost"}
      className={cn(
        "snap-start flex shrink-0 grow cursor-pointer items-center justify-center whitespace-nowrap transition-[color,background-color,box-shadow]",
        className,
      )}
      data-value={value}
      data-slot="tabs-trigger"
      onClick={() => {
        scrollToValue(value);
      }}
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
      className={cn(
        "snap-start shrink-0 w-full flex items-center justify-center",
        className,
      )}
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
