import CopyToClipboard from "@/components/CopyToClipboard";
import { Button } from "@/components/ui/button";
import {
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { useAppBranding } from "@/hooks/useAppBranding";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { actionsRef } from "./SetupTwoFactor";

function SaveRecoveryCodes(props: { backupCodes: string[] }) {
  const { app } = useAppBranding();

  const { backupCodes } = props;
  const { t } = useTranslation();

  return (
    <DialogPopup showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>{t("Save your backup code")}</DialogTitle>
      </DialogHeader>
      <DialogPanel className="flex flex-col gap-3">
        <FieldGroup>
          <Field>
            <p className="text-sm">
              {t(
                "Save this emergency backup code and store it somewhere safe. if you lose your device, this code can be used to disable two-step authentication and access your account.",
              )}
            </p>
          </Field>
          <Field>
            <ul className="grid grid-cols-3 p-3 border rounded-md">
              {backupCodes.map((code, idx) => (
                <li key={idx}>{code}</li>
              ))}
            </ul>
          </Field>
          <Field orientation={"horizontal"} className="max-w-fit">
            <CopyToClipboard
              label={"Copy"}
              text={backupCodes.join("\n")}
              render={<Button variant={"secondary"}></Button>}
            />
            <Button
              variant={"secondary"}
              onClick={() => {
                const blob = new Blob([backupCodes.join("\n")], {
                  type: "text/plain",
                });
                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = `${app?.name?.toLowerCase() ?? "hurutech"}-recovery-codes.txt`;
                a.click();

                URL.revokeObjectURL(url);
              }}
            >
              <Download /> {t("Download")}
            </Button>
          </Field>

          <Button onClick={actionsRef.current?.close}>
            {t("I have saved my backup code")}
          </Button>
        </FieldGroup>
      </DialogPanel>
    </DialogPopup>
  );
}

export default SaveRecoveryCodes;
