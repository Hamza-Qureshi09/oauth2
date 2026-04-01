import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useForm } from "react-hook-form";
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
import VerifyAuthenticator from "./VerifyAuthenticator";
import type { DialogRootActions } from "@base-ui/react";

const DefaultForm = {
  issuer: "",
  password: "",
};

export type TAuthData = { totpURI: string; backupCodes: string[] };

export const setupTwoFactorRef = React.createRef<DialogRootActions>();

function SetupTwoFactor() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);
  const [authData, setAuthData] = React.useState<TAuthData>();

  const { register, handleSubmit, formState, reset } = useForm<
    typeof DefaultForm
  >({
    defaultValues: DefaultForm,
  });

  const onSubmit = async (formData: typeof DefaultForm) => {
    const { data, error } = await authClient.twoFactor.enable(formData);

    if (error) {
      toast.error(error.message);
      return;
    }

    setAuthData(data);
    reset();
  };

  return (
    <Dialog
      actionsRef={setupTwoFactorRef}
      onOpenChange={(open) => {
        if (open === false) {
          setAuthData(undefined);
          setShowPassword(false);
        }
      }}
    >
      <DialogTrigger
        render={(props) => (
          <Button size="sm" {...props}>
            {t("Enable")}
          </Button>
        )}
      ></DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{t("Enable Two Step Authentication")}</DialogTitle>
          <DialogDescription>
            {t("Verify your identity to enable it")}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="issuer">{t("Issuer")}</FieldLabel>
                <Input
                  id="issuer"
                  type="text"
                  placeholder={t("e.g My Application")}
                  {...register("issuer", {
                    required: t("Issuer is required!"),
                  })}
                />

                <FieldError>{formState.errors.issuer?.message}</FieldError>
              </Field>

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
            </FieldGroup>
          </form>
        </DialogPanel>
        <DialogFooter variant="bare">
          <Button
            variant={"secondary"}
            disabled={formState.isSubmitting || !formState.isDirty}
            onClick={handleSubmit(onSubmit)}
          >
            {formState.isSubmitting && <Spinner />}
            {t("Submit")}
          </Button>

          {formState.isSubmitted && authData ? (
            <VerifyAuthenticator authData={authData} />
          ) : null}
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export default SetupTwoFactor;
