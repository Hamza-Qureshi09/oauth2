import { Calendar } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

export function DateTimeInput({
  type = "date",
  className,
  ...props
}: { type?: "date" | "time" } & Omit<
  React.ComponentProps<typeof Input>,
  "type"
>) {
  return (
    <div className={cn("relative", className)}>
      <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 peer-disabled:opacity-50">
        <Calendar className="size-4" />
        <span className="sr-only">Date</span>
      </div>
      <Input
        type={type}
        step="1"
        className="peer bg-background appearance-none pl-9 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        {...props}
      />
    </div>
  );
}
