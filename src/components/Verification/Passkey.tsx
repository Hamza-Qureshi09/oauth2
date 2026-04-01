import { useTranslation } from "react-i18next";
import { Spinner } from "../ui/spinner";

function PasskeyVerification() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2 grow w-full min-h-20 items-center justify-center">
      <Spinner className="size-4" />
      <p className="text-sm text-muted-foreground">{t("Loading...")}</p>
    </div>
  );
}

export default PasskeyVerification;
