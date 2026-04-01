import CopyToClipboard from "@/components/CopyToClipboard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { useAppBranding } from "@/hooks/useAppBranding";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { setupTwoFactorRef } from "./SetupTwoFactor";

function SaveRecoveryCodes(props: { backupCodes: string[] }) {
  const { app } = useAppBranding();

  const { backupCodes } = props;
  const { t } = useTranslation();

  return (
    <Dialog defaultOpen={true}>
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
          </FieldGroup>
        </DialogPanel>
        <DialogFooter variant="bare">
          <DialogClose
            render={(props) => (
              <Button
                {...props}
                onClick={() => {
                  setupTwoFactorRef.current?.close();
                }}
              />
            )}
          >
            {t("I have saved my backup code")}
          </DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export default SaveRecoveryCodes;
