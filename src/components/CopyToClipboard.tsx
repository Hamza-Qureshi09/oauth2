import { CheckCircle2Icon, CopyIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Popover, PopoverPopup, PopoverTrigger } from "./ui/popover";
import React from "react";
import type { DialogTrigger } from "@base-ui/react";

function CopyToClipboard({
  render,
  text,
  label,
  timeout = 1000,
}: {
  render?: React.ComponentProps<typeof DialogTrigger>["render"];
  label?: string;
  text: string;
  timeout?: number;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const timeoutIdRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyToClipboard = (value: string) => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      return;
    }

    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      setIsOpen(true);

      if (timeout !== 0) {
        timeoutIdRef.current = setTimeout(() => {
          setIsOpen(false);
          timeoutIdRef.current = null;
        }, timeout);
      }
    }, console.error);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          render ?? (
            <Button
              aria-label={text}
              size="xs"
              variant="outline"
              className="text-xs max-w-fit"
            />
          )
        }
        onClick={() => copyToClipboard(text)}
      >
        {label ? "" : text} <CopyIcon /> {label}
      </PopoverTrigger>
      <PopoverPopup side="top" tooltipStyle>
        <div className="flex items-center gap-1">
          <CheckCircle2Icon className="fill-green-700 stroke-background size-4" />
          <p>Copied!</p>
        </div>
      </PopoverPopup>
    </Popover>
  );
}

export default CopyToClipboard;
