import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { authClient } from "@/lib/auth";
import { QRcode } from "@/components/QRCode";
import React from "react";
import { actionsRef, type TAuthData } from "./SetupTwoFactor";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DefaultForm = {
  code: "",
  trustDevice: false,
};

function VerifyAuthenticator({
  authData,
  onVerifyComplete,
}: {
  authData?: TAuthData;
  onVerifyComplete: () => void;
}) {
  const { t } = useTranslation();
  const [step, setStep] = React.useState(0);

  const [type, setType] = React.useState<"qr" | "manual">("qr");

  const { control, handleSubmit, formState, reset } = useForm<
    typeof DefaultForm
  >({
    defaultValues: DefaultForm,
  });

  const onSubmit = async (formData: typeof DefaultForm) => {
    const { error } = await authClient.twoFactor.verifyTotp(formData);

    if (error) {
      toast.error(error.message);
      return;
    }

    reset();
    onVerifyComplete();
  };

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
          <FieldGroup>
            <Field>
              <p className="text-sm">
                {t(
                  "Please enter your 6-digit authentication code from your authenticator app.",
                )}
              </p>
            </Field>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <div className="w-full flex flex-col items-center">
                    <Controller
                      control={control}
                      name="code"
                      rules={{ required: t("Code is required!") }}
                      render={({ field }) => (
                        <InputOTP
                          maxLength={6}
                          id="otp-verification"
                          value={field.value}
                          onChange={(value) => field.onChange(value)}
                        >
                          <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator className="mx-2" />
                          <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      )}
                    />
                  </div>

                  <FieldError>{formState.errors.code?.message}</FieldError>
                </Field>

                <Field>
                  <Controller
                    name="trustDevice"
                    control={control}
                    render={({ field }) => (
                      <Field orientation="horizontal">
                        <Checkbox
                          id="trustDevice"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label htmlFor="trustDevice">
                          {t("Trust this device?")}
                        </Label>
                      </Field>
                    )}
                  />
                </Field>

                <Field orientation={"horizontal"} className="justify-end">
                  <Button variant={"secondary"} onClick={() => setStep(0)}>
                    {t("Back")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={formState.isSubmitting || !formState.isDirty}
                  >
                    {formState.isSubmitting && <Spinner />}
                    {t("Verify")}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </FieldGroup>
        </DialogPanel>
      )}
    </DialogPopup>
  );
}

export default VerifyAuthenticator;
