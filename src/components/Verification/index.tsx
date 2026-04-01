import React from "react";
import { useTranslation } from "react-i18next";
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetTitle,
} from "../ui/sheet";
import { Radio, RadioGroup } from "../ui/radio-group";
import {
  BrickWallShieldIcon,
  KeyIcon,
  LockIcon,
  MailIcon,
  MessagesSquareIcon,
} from "lucide-react";
import Item from "../Item";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ActionSheetRef } from "@/registry/ActionSheet";
import PasswordVerification from "./Password";
import EmailVerification from "./Email";
import SmsVerification from "./Sms";
import TwoStepVerification from "./TwoStep";
import PasskeyVerification from "./Passkey";

type TMethod = "passkey" | "sms" | "2-step" | "email" | "password";

function Verification() {
  const { t } = useTranslation();
  const [method, setMethod] = React.useState<TMethod>();
  const [step, setStep] = React.useState(0);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-xl">
          {t("Verification required")}
        </SheetTitle>
        <SheetDescription>
          {t(
            "To make changes to your account, verify your identity using one of the options below.",
          )}
        </SheetDescription>
      </SheetHeader>

      {step === 0 ? (
        <>
          <SheetPanel>
            <RadioGroup
              className="gap-1"
              defaultValue={method}
              onValueChange={setMethod}
            >
              {[
                {
                  icon: LockIcon,
                  label: "Password",
                  value: "password",
                },
                {
                  icon: KeyIcon,
                  label: "Passkey",
                  value: "passkey",
                },
                {
                  icon: BrickWallShieldIcon,
                  label: "2-Step authenticator",
                  value: "2-step",
                },
                {
                  icon: MessagesSquareIcon,
                  label: "Sms",
                  value: "sms",
                },
                {
                  icon: MailIcon,
                  label: "Email",
                  value: "email",
                },
              ].map((item, index) => (
                <Item key={index} className="bg-muted">
                  <Label className="grow">
                    <div className="flex items-center gap-3 w-full">
                      <item.icon />
                      <div className="flex items-center gap-3 w-full">
                        <h3 className="font-medium">{t(item.label)}</h3>
                      </div>

                      <Radio value={item.value} />
                    </div>
                  </Label>
                </Item>
              ))}
            </RadioGroup>
          </SheetPanel>

          <SheetFooter variant="bare">
            <Button
              variant={"outline"}
              onClick={() =>
                ActionSheetRef.current?.trigger("verification", false)
              }
            >
              {t("Cancel")}
            </Button>
            <Button onClick={() => setStep(1)}>{t("Submit")}</Button>
          </SheetFooter>
        </>
      ) : (
        <>
          <SheetPanel>
            {method === "password" ? (
              <PasswordVerification />
            ) : method === "email" ? (
              <EmailVerification />
            ) : method === "sms" ? (
              <SmsVerification />
            ) : method === "2-step" ? (
              <TwoStepVerification />
            ) : method === "passkey" ? (
              <PasskeyVerification />
            ) : null}
          </SheetPanel>
        </>
      )}
    </>
  );
}

export default Verification;
