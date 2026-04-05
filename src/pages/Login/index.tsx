import { KeyIcon } from "lucide-react";
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
        <div className={cn("flex flex-col gap-5")}>
          <Card className="relative">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{t("Verify yourself")}</CardTitle>
            </CardHeader>

            <CardContent>
              <VerifyTwoFactor
                onVerifyComplete={() => navigate("/" + window.location.search)}
              />
            </CardContent>
          </Card>
        </div>
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
