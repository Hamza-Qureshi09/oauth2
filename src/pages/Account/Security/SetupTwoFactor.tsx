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
import ScanAndVerifyAuth from "./ScanAndVerifyAuth";
import type { DialogRootActions } from "@base-ui/react";
import SaveRecoveryCodes from "./SaveRecoverCodes";

const DefaultForm = {
  issuer: "",
  password: "",
};

export const actionsRef = React.createRef<DialogRootActions>();

export type TAuthData = { totpURI: string; backupCodes: string[] };

function SetupTwoFactor() {
  const { t } = useTranslation();
  const [authData, setAuthData] = React.useState<TAuthData>();
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (authData) setStep(1);
  }, [authData]);

  return (
    <>
      <Dialog
        actionsRef={actionsRef}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setStep(0);
            setAuthData(undefined);

            actionsRef.current?.unmount();
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

        {step === 0 ? (
          <VerifyIdentity onSuccess={setAuthData} />
        ) : step === 1 ? (
          <ScanAndVerifyAuth
            authData={authData}
            onVerifyComplete={() => setStep(2)}
          />
        ) : step === 2 ? (
          <SaveRecoveryCodes backupCodes={authData?.backupCodes ?? []} />
        ) : null}
      </Dialog>
    </>
  );
}

export default SetupTwoFactor;

function VerifyIdentity({
  onSuccess,
}: {
  onSuccess: (authData: TAuthData) => void;
}) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

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

    onSuccess(data);
    reset();
  };

  return (
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

            <Button
              type="submit"
              variant={"secondary"}
              disabled={formState.isSubmitting || !formState.isDirty}
              className="max-w-fit"
            >
              {formState.isSubmitting && <Spinner />}
              {t("Submit")}
            </Button>
          </FieldGroup>
        </form>
      </DialogPanel>
    </DialogPopup>
  );
}
