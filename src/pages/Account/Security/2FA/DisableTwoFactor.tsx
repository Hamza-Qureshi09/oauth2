import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import React from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { authClient } from "@/lib/auth";
import { toast } from "sonner";
import type { DialogRootActions } from "@base-ui/react";

const DefaultForm = {
  password: "",
};

function DisableTwoFactor() {
  const { t } = useTranslation();
  const actionsRef = React.useRef<DialogRootActions>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState, reset } = useForm<
    typeof DefaultForm
  >({
    defaultValues: DefaultForm,
  });

  const onSubmit: SubmitHandler<typeof DefaultForm> = async (formData) => {
    const { error } = await authClient.twoFactor.disable(formData);

    if (error) {
      toast.error(error.message);
      return;
    }

    actionsRef.current?.close();
    reset();
  };

  return (
    <Dialog actionsRef={actionsRef}>
      <DialogTrigger
        render={(props) => (
          <Button size="sm" variant="destructive" {...props}>
            {t("Disable")}
          </Button>
        )}
      ></DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{t("Confirm your identity")}</DialogTitle>
          <DialogDescription>
            {t("Verify your password to disable 2-step")}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
                    autoComplete="current-password webauthn"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: t("Password is required!"),
                    })}
                  />
                  <InputGroupAddon align="inline-end">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {!showPassword ? <EyeIcon /> : <EyeOffIcon />}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
              </Field>

              <Button
                type="submit"
                variant={"secondary"}
                className="max-w-fit"
                disabled={formState.isSubmitting || !formState.isDirty}
              >
                {formState.isSubmitting && <Spinner />}
                {t("Submit")}
              </Button>
            </FieldGroup>
          </form>
        </DialogPanel>
      </DialogPopup>
    </Dialog>
  );
}

export default DisableTwoFactor;
