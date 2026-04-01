import React from "react";
import type { TActionSheetRef } from "@/components/ActionSheet";
import Verification from "@/components/Verification";

export type TActionSheetRegistry = typeof ActionSheetRegistery;

export const ActionSheetRegistery = {
  verification: Verification,
};

export const ActionSheetRef = React.createRef<TActionSheetRef>();
