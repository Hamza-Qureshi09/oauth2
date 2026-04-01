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
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

function SaveClientSecret(props: { secret: string; onDone: () => void }) {
  const { secret, onDone } = props;
  const { t } = useTranslation();
  const { copyToClipboard } = useCopyToClipboard({
    onCopy: () => toast.success(t("Copied")),
  });

  return (
    <Dialog defaultOpen={true}>
      <DialogPopup showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{t("New client")}</DialogTitle>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-3">
          <h6 className="font-medium">{t("Keep your key safe")}</h6>
          <p className="text-sm">
            {t(
              "Save and store this new key to a secure place, such as a password manager or secret store. You won't be able to see it again.",
            )}
          </p>

          <Textarea
            defaultValue={secret}
            className="select-all cursor-pointer"
            onClick={() => copyToClipboard(secret)}
            readOnly
          ></Textarea>
        </DialogPanel>
        <DialogFooter variant="bare">
          <DialogClose
            render={(props) => (
              <Button
                variant={"secondary"}
                {...props}
                onClick={(e) => {
                  onDone();
                  props.onClick?.(e);
                }}
              />
            )}
          >
            {t("Done")}
          </DialogClose>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export default SaveClientSecret;
