import { cn } from "@/lib/utils";

function Item({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  ref?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      className={cn(
        "p-3 flex items-center justify-between gap-3 rounded-xs first:rounded-t-lg last:rounded-b-lg bg-background backdrop-blur-sm border/90 w-full",
        className,
      )}
      {...props}
    />
  );
}
export default Item;
