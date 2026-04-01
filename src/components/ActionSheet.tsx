/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: off */
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import React from "react";
import { Sheet, SheetPopup } from "@/components/ui/sheet";
import {
  ActionSheetRegistery,
  type TActionSheetRegistry,
} from "../registry/ActionSheet";
import { Button } from "./ui/button";

type TSheetName = keyof TActionSheetRegistry;

export interface ActionSheetProps {
  /** Render prop gets the latest data passed to isOpen(true, data) */
  children: () => React.ReactNode;
}

export type TActionSheetRef = {
  /** Open/close the sheet; optionally pass data of type T */
  trigger: <K extends TSheetName>(
    sheetName: K,
    value: boolean,
    data?: Parameters<TActionSheetRegistry[K]>[number],
  ) => void;
};

export const ActionSheet = ({ ref }: { ref: React.Ref<TActionSheetRef> }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [data, setData] = React.useState<
    | {
        sheetName: TSheetName;
        data?: Parameters<TActionSheetRegistry[TSheetName]>[number];
      }
    | undefined
  >(undefined);

  React.useImperativeHandle(ref, () => ({
    trigger: (name, value, nextData) => {
      setIsOpen(value);
      setData({ sheetName: name, data: nextData });
    },
  }));

  const Comp = React.useMemo(
    () => (data?.sheetName ? ActionSheetRegistery[data?.sheetName] : undefined),
    [data],
  );

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(value) => {
        setIsOpen(value);
        if (!value) setData(undefined);
      }}
    >
      <div className="px-3">
        <SheetPopup
          side="bottom"
          className="max-w-sm mx-auto rounded-2xl mb-2"
          showCloseButton={false}
        >
          <SheetPrimitive.Close
            aria-label="Close"
            className="absolute end-5 top-5"
            render={<Button size="icon" variant="outline" />}
          >
            <XIcon />
          </SheetPrimitive.Close>
          {Comp && isOpen ? <Comp {...(data?.data as any)} /> : null}
        </SheetPopup>
      </div>
    </Sheet>
  );
};
