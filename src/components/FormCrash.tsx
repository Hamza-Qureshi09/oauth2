import { CircleAlertIcon, RefreshCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

function FormCrash({ error }: { error: Error | null }) {
  const { t } = useTranslation();

  return error ? (
    <div className="absolute top-0 left-0 right-0 bottom-0 bg-background/80 h-full z-1">
      <div className="flex gap-2 bg-linear-to-b from-muted to-transparent p-3 min-h-50">
        <CircleAlertIcon className="fill-destructive stroke-background" />

        <div className="flex flex-col gap-1">
          <p className="text-destructive font-medium">{error.name}</p>
          <p className="text-destructive text-xs mb-1">{error.message}</p>

          <div>
            <Button
              size="xs"
              variant={"outline"}
              onClick={() => window.location.reload()}
            >
              <RefreshCcw /> {t("Retry")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
}
export default FormCrash;
