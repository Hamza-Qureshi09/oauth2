import { Controller, useForm } from "react-hook-form";
import { Field, FieldError } from "../ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { useTranslation } from "react-i18next";

const DefaultForm = {
  code: undefined,
};

function TwoStepVerification({
  submit,
}: {
  submit: (data: typeof DefaultForm) => void;
}) {
  const { t } = useTranslation();

  const { control, handleSubmit, formState, reset } = useForm<
    typeof DefaultForm
  >({
    defaultValues: DefaultForm,
  });

  const onSubmit = async (formData: typeof DefaultForm) => {
    reset();
    submit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field className="gap-3">
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
    </form>
  );
}

export default TwoStepVerification;
