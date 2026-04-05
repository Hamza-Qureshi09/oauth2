import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const DefaultForm = {
  code: "",
  trustDevice: false,
};

function VerifyTwoFactor({
  onVerifyComplete,
  footerContent,
}: {
  onVerifyComplete: () => void;
  footerContent?: () => React.ReactNode;
}) {
  const { t } = useTranslation();

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
    onVerifyComplete();
    reset();
  };

  return (
    <div>
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
              {footerContent?.()}
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
    </div>
  );
}

export default VerifyTwoFactor;
