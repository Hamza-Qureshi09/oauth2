import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { InfoIcon, RefreshCcwIcon } from "lucide-react";

function EmailVerification() {
  const { t } = useTranslation();
  return (
    <>
      <p className="text-sm text-muted-foreground">
        {t("We've sent a verification link to:")}
      </p>
      <p>{"abdullahkhan@yahoo.com"}</p>
      <Button variant={"link"} className="px-0 text-primary">
        <RefreshCcwIcon />
        {t("Resend link")}
      </Button>

      <div className="flex items-start gap-2 bg-muted p-2 rounded-md text-muted-foreground">
        <InfoIcon />
        <p className="text-sm">
          {t(
            "Make sure to open the link in another tab on the same browser and device.",
          )}
        </p>
      </div>
    </>
  );
}

export default EmailVerification;
