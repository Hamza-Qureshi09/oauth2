import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { useTranslation } from "react-i18next";
import { QRcode } from "@/components/QRCode";
import React from "react";
import { actionsRef, type TAuthData } from "./SetupTwoFactor";
import VerifyTwoFactor from "./VerifyTwoFactor";

function ScanAndVerifyAuth({
  authData,
  onVerifyComplete,
}: {
  authData?: TAuthData;
  onVerifyComplete: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(0);

  const [type, setType] = React.useState<"qr" | "manual">("qr");

  return (
    <DialogPopup showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>{t("Use Authenticator")}</DialogTitle>
      </DialogHeader>

      {step === 0 ? (
        <DialogPanel>
          <FieldGroup>
            <Field>
              <p className="text-sm">
                {t(
                  "Use a free authenticator app (Such as Google Authenticator, Microsoft Authenticator or Authy) to scan this QR code to set up your account.",
                )}
              </p>
            </Field>
            <Field>
              {authData ? (
                <div className="flex flex-col gap-3 items-center justify-center">
                  {type === "qr" ? (
                    <QRcode value={authData.totpURI} />
                  ) : (
                    <div className="border p-2 rounded-md max-w-sm">
                      <p className="text-sm break-all select-all selection:bg-primary">
                        {decodeURIComponent(authData.totpURI)}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="link"
                    className="text-primary no-underline!"
                    onClick={() =>
                      setType((prev) => (prev === "qr" ? "manual" : "qr"))
                    }
                  >
                    {t(
                      type === "qr" ? "Enter manually" : "Use QR code instead",
                    )}
                  </Button>
                </div>
              ) : null}
            </Field>

            <Field orientation={"horizontal"} className="justify-end">
              <Button variant="secondary" onClick={actionsRef.current?.close}>
                {t("Cancel")}
              </Button>
              <Button onClick={() => setStep(1)}>{t("Continue")}</Button>
            </Field>
          </FieldGroup>
        </DialogPanel>
      ) : (
        <DialogPanel>
          <VerifyTwoFactor
            onVerifyComplete={onVerifyComplete}
            footerContent={() => (
              <Button variant={"secondary"} onClick={() => setStep(0)}>
                {t("Back")}
              </Button>
            )}
          />
        </DialogPanel>
      )}
    </DialogPopup>
  );
}

export default ScanAndVerifyAuth;
