import { cn } from "@/lib/utils";
import {
  useVirtualizer,
  type VirtualItem,
  type Virtualizer,
} from "@tanstack/react-virtual";
import React from "react";

type VirtualizerConfig = Omit<
  Parameters<typeof useVirtualizer<HTMLDivElement, Element>>[0],
  "getScrollElement"
>;

function VirtualList({
  config,
  className,
  contentClassName,
  children,
  ...props
}: Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  config: VirtualizerConfig;
  contentClassName?: string;
  children: (
    virtualizer: Virtualizer<HTMLDivElement, Element>,
    items: VirtualItem[],
  ) => React.ReactNode;
}) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    ...config,
    getScrollElement: () => parentRef.current,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className={cn("overflow-y-auto contain-strict w-full h-svh", className)}
      {...props}
    >
      <div
        className={cn("relative w-full max-w-lg mx-auto", contentClassName)}
        style={{
          height: virtualizer.getTotalSize(),
        }}
      >
        <div
          className="absolute top-0 left-0 flex flex-col gap-1 w-full px-3"
          style={{
            transform: `translateY(${items[0]?.start ?? 0}px)`,
          }}
        >
          {children(virtualizer, items)}
        </div>
      </div>
    </div>
  );
}

export default VirtualList;
