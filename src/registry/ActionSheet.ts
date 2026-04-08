import React from "react";
import type { TActionSheetRef } from "@/components/ActionSheet";
import Verification from "@/components/Verification";
import { ConfirmationSheet } from "@/components/Confirmation";

export type TActionSheetRegistry = typeof ActionSheetRegistery;

export const ActionSheetRegistery = {
  verification: Verification,
  confirmation: ConfirmationSheet,
};

export const ActionSheetRef = React.createRef<TActionSheetRef>();
