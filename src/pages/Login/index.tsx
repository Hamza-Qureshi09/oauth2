import { ClipboardPasteIcon, KeyIcon } from "lucide-react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router";
import FormCrash from "@/components/FormCrash";
import FormWrapper from "@/components/FormWrapper";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { useCapabilities } from "@/hooks/useCapabilities";
import { authClient } from "@/lib/auth";
import { authProviders } from "@/lib/providers";
import { cn } from "@/lib/utils";
import CredentialsForm from "./Credentials";
import MagicLinkForm from "./MagicLink";
import { toast } from "sonner";
import { useAppBranding } from "@/hooks/useAppBranding";
import VerifyTwoFactor from "../Account/Security/VerifyTwoFactor";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";

type ProviderKey = keyof typeof authProviders;

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { error } = useAppBranding();

  const { capabilities } = useCapabilities();

  const [showMagicLink, setShowMagicLink] = React.useState(false);
  const [showTwoStep, setShowTwoStep] = React.useState(false);

  const magicLink = React.useMemo(
    () => capabilities?.includes("magicLink"),
    [capabilities],
  );

  const passkey = React.useMemo(
    () => capabilities?.includes("passkey"),
    [capabilities],
  );

  const enabledProviders = React.useMemo(() => {
    const caps = new Set(capabilities ?? []);
    return (
      Object.entries(authProviders) as [
        ProviderKey,
        (typeof authProviders)[ProviderKey],
      ][]
    ).filter(([key]) => caps.has(key)); // if capabilities isn't typed as ProviderKey[], see note below
  }, [capabilities]);

  React.useEffect(() => {
    if (magicLink) setShowMagicLink(true);
  }, [magicLink]);

  return (
    <FormWrapper title={t("Login")}>
      {showTwoStep ? (
        <TwoFactorForm />
      ) : (
        <div className={cn("flex flex-col gap-5")}>
          <Card className="relative">
            <FormCrash error={error} />

            <CardHeader className="text-center">
              <CardTitle className="text-xl">{t("Welcome back")}</CardTitle>
              <CardDescription>
                {t("Login securely with your desired option")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="pb-2">
                <Field>
                  <div className="flex gap-3 flex-wrap">
                    {enabledProviders.map(([key, { icon, label, invert }]) => (
                      <Button
                        variant="outline"
                        type="button"
                        key={key}
                        className={"grow"}
                        onClick={async () => {
                          const Response = await authClient.signIn.social({
                            provider: key,
                          });

                          if (!Response.error)
                            navigate("/" + window.location.search);
                        }}
                      >
                        <img
                          src={icon}
                          className={cn(invert && "dark:invert")}
                          alt={label}
                        />
                        {t("Sign in with {{provider}}", { provider: label })}
                      </Button>
                    ))}
                  </div>
                </Field>

                {enabledProviders.length > 0 && (
                  <FieldSeparator>{t("Or continue with")}</FieldSeparator>
                )}

                <Field>
                  {showMagicLink ? (
                    <MagicLinkForm />
                  ) : (
                    <CredentialsForm
                      onShowTwoStep={() => setShowTwoStep(true)}
                    />
                  )}

                  {magicLink && (
                    <Button
                      type="button"
                      variant={"outline"}
                      onClick={() => setShowMagicLink(!showMagicLink)}
                    >
                      {t(
                        showMagicLink
                          ? "Sign-in with Credentials"
                          : "Sign-in with Magic Link",
                      )}
                    </Button>
                  )}
                </Field>
              </FieldGroup>
              <Field>
                {passkey && (
                  <Button
                    variant={"secondary"}
                    onClick={async () => {
                      const { error } = await authClient.signIn.passkey();

                      if (error) {
                        toast.error(error.message);
                        return;
                      }

                      navigate("/" + window.location.search);
                    }}
                  >
                    <KeyIcon />
                    {t("Sign-in with Passkey")}
                  </Button>
                )}
                <FieldDescription className="text-center">
                  <Trans i18nKey={"noAccount"}>
                    Don't have an account? <Link to="/signup">Sign up</Link>
                  </Trans>
                </FieldDescription>
              </Field>
            </CardContent>
          </Card>
          <FieldDescription className="px-6 text-center">
            <Trans i18nKey={"agreement"}>
              By clicking continue, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>.
            </Trans>
          </FieldDescription>
        </div>
      )}
    </FormWrapper>
  );
}

export default Login;

const DefaultForm = {
  code: "",
  trustDevice: false,
};

function TwoFactorForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [useBackup, setUseBackup] = React.useState(false);

  const { control, handleSubmit } = useForm<typeof DefaultForm>({
    defaultValues: DefaultForm,
  });

  const onSubmit: SubmitHandler<typeof DefaultForm> = async (formData) => {
    const { error } = await authClient.twoFactor.verifyBackupCode({
      ...formData,
      disableSession: false,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    navigate("/" + window.location.search);
  };

  return (
    <div className={cn("flex flex-col gap-5")}>
      <Card className="relative">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("Verify yourself")}</CardTitle>
        </CardHeader>

        <CardContent>
          {useBackup ? (
            <form onSubmit={handleSubmit(onSubmit)}>
              <FieldGroup>
                <Field>
                  <p className="text-sm">
                    {t(
                      "Use your emergency backup code that you store somewhere when setting up the two step authentication",
                    )}
                  </p>
                </Field>

                <Controller
                  control={control}
                  name="code"
                  rules={{ required: t("Backup code is required!") }}
                  render={({ field, fieldState }) => (
                    <>
                      {field.value ? (
                        <Field>
                          <Input
                            placeholder={t("Enter your backup code")}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value)}
                          />

                          <FieldError>{fieldState.error?.message}</FieldError>
                        </Field>
                      ) : null}
                      <Field orientation={"horizontal"} className="max-w-fit">
                        <Button
                          onClick={async () => {
                            try {
                              const text = await navigator.clipboard.readText();
                              field.onChange(text);
                            } catch (err) {
                              console.error("Clipboard read failed:", err);
                            }
                          }}
                        >
                          <ClipboardPasteIcon /> {t("Paste")}
                        </Button>
                      </Field>
                    </>
                  )}
                />

                <Field orientation={"horizontal"} className="justify-end">
                  <Button
                    variant={"secondary"}
                    onClick={() => setUseBackup(false)}
                  >
                    {t("Use 2-step code?")}
                  </Button>
                  <Button type="submit">{t("Restore account")}</Button>
                </Field>
              </FieldGroup>
            </form>
          ) : (
            <VerifyTwoFactor
              onVerifyComplete={() => navigate("/" + window.location.search)}
              footerContent={() => (
                <Button variant="secondary" onClick={() => setUseBackup(true)}>
                  {t("Use backup to restore?")}
                </Button>
              )}
            />
          )}
        </CardContent>
      </Card>

      <FieldDescription className="text-center">
        <Trans i18nKey={"otherWayLogin"}>
          Use an other way to login? <Link to="/">Login</Link>
        </Trans>
      </FieldDescription>
    </div>
  );
}
