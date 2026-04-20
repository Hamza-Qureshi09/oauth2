import React from "react";
import type { TActionSheetRef } from "@/components/ActionSheet";
import Verification from "@/components/Verification";
import { ConfirmationSheet } from "@/components/Confirmation";
import { SessionSwitcher } from "@/pages/Account/SessionSwitcher";

export type TActionSheetRegistry = typeof ActionSheetRegistery;

export const ActionSheetRegistery = {
  verification: Verification,
  confirmation: ConfirmationSheet,
  sessionSwitcher: SessionSwitcher,
};

export const ActionSheetRef = React.createRef<TActionSheetRef>();
