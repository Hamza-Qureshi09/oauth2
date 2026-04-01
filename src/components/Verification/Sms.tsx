import { useTranslation } from "react-i18next";
import { Field } from "../ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { Button } from "../ui/button";
import { RefreshCcwIcon } from "lucide-react";

function SmsVerification() {
  const { t } = useTranslation();

  return (
    <Field className="gap-3">
      <div className="w-full flex flex-col items-center">
        <InputOTP maxLength={6} id="otp-verification" required>
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
      </div>

      <div className="flex justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {t("Didn't receive the code?")}
        </p>
        <Button variant="outline" size="xs">
          <RefreshCcwIcon />
          {t("Resend Code")}
        </Button>
      </div>
    </Field>
  );
}

export default SmsVerification;
