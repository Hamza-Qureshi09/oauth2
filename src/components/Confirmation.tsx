import React from "react";
import { useTranslation } from "react-i18next";
import {
    SheetDescription,
    SheetHeader,
    SheetPanel,
    SheetTitle,
} from "./ui/sheet";
import { Button } from "./ui/button";
import { ActionSheetRef } from "@/registry/ActionSheet";
import { Input } from "./ui/input";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";

type ConfirmationSheetProps =
    | {
        type: "normal";
        onConfirm: (dismiss: () => void) => void | Promise<void>;
    }
    | {
        type: "strict";
        hint: string;
        onConfirm: (dismiss: () => void) => void | Promise<void>;
    };

export const ConfirmationSheet: React.FC<ConfirmationSheetProps> = (props) => {
    const { t } = useTranslation();
    const [value, setValue] = React.useState("");

    return (
        <>
            <SheetHeader>
                <SheetTitle>
                    {t("Confirmation")}
                </SheetTitle>
                <SheetDescription>
                    {t("Are you sure you want to do this action?")}
                </SheetDescription>
            </SheetHeader>

            <SheetPanel>
                <FieldGroup>
                    {props.type === "strict"
                        ? (
                            <Field>
                                <FieldLabel htmlFor="hint">
                                    {t("Type {{hint}} to confirm the action", {
                                        hint: props.hint,
                                    })}
                                </FieldLabel>
                                <Input
                                    type="text"
                                    id="hint"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                                {(value && value !== props.hint)
                                    ? (
                                        <FieldError>
                                            {t(
                                                "please type a correct hint!",
                                            )}
                                        </FieldError>
                                    )
                                    : null}
                            </Field>
                        )
                        : null}

                    <Field orientation={"horizontal"} className="justify-end">
                        <Button
                            variant={"outline"}
                            onClick={() =>
                                ActionSheetRef.current?.trigger(
                                    "confirmation",
                                    false,
                                )}
                        >
                            {t("Dismiss")}
                        </Button>
                        <Button
                            disabled={props.type === "strict" &&
                                value !== props.hint}
                            onClick={() =>
                                props.onConfirm?.(() => {
                                    ActionSheetRef.current?.trigger(
                                        "confirmation",
                                        false,
                                    );
                                })}
                        >
                            {t("Confirm")}
                        </Button>
                    </Field>
                </FieldGroup>
            </SheetPanel>
        </>
    );
};
