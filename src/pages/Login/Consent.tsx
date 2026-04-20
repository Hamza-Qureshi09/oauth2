import FormCrash from "@/components/FormCrash";
import FormWrapper from "@/components/FormWrapper";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldDescription } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
// import { oauth2Client } from "@/lib/auth";
import { cn, getInitials } from "@/lib/utils";
import { EllipsisIcon } from "lucide-react";
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import useSWR from "swr";
import { ThunderSDK } from "thunder-sdk";

function Consent() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const redirectUri = searchParams.get("redirect_uri");

  const { error, isLoading } = useSWR(
    "oauth2Client",
    async () =>
      await ThunderSDK.oauthClients.get({
        params: { id: searchParams.get("client_id") ?? "" },
        query: {},
      }),
  );

  const scopes = React.useMemo(
    () => searchParams.get("scope")?.trim()?.split(/\s+/),
    [searchParams],
  );

  async function consentAction() {
    const Response = await ThunderSDK.oauth.consent({
      query: {
        client_id: searchParams.get("client_id") ?? "",
        redirect_uri: redirectUri ?? "",
        state: searchParams.get("state") ?? "",
        scope: searchParams.get("scope") ?? "",
        response_type: (searchParams.get("response_type") as "code") ?? "code",
        code_challenge: searchParams.get("code_challenge") ?? "",
        code_challenge_method:
          (searchParams.get("code_challenge_method") as "S256") ?? "",
      },
      body: { resourceGrant: {} },
    });

    if (!Response?._id) {
      toast.error(t("Failed to process consent"));
      return;
    }

    navigate("/" + window.location.search, {
      replace: true,
      viewTransition: true,
    });
  }
  const clientName = "unknown";

  return (
    <FormWrapper
      title={t("Authorize access")}
      consentLogo={
        <React.Fragment>
          <Avatar className="rounded-xl size-16 bg-transparent">
            {isLoading ? (
              <Skeleton className="w-16 h-16" />
            ) : (
              <React.Fragment>
                {/* <AvatarImage src={client?.logo_uri} alt={clientName} /> */}
                <AvatarFallback className="rounded-md">
                  {getInitials(clientName)}
                </AvatarFallback>
              </React.Fragment>
            )}
          </Avatar>

          <EllipsisIcon className="text-muted-foreground" />
        </React.Fragment>
      }
    >
      <div className={cn("flex flex-col gap-5")}>
        <Card className="relative">
          <FormCrash error={error} />

          <CardHeader>
            <CardTitle className="text-xl">
              {t("Authorize {{app_name}}", {
                app_name: clientName,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">
              {t("Third-party is requesting access to:")}
            </p>
            <ul className="px-5 py-2 list-disc indent-1">
              {Object.entries({
                email: "Access email address",
                profile: "Access details about your profile",
                openid: "Access your identity documents",
                offline_access: "Read and edit your account resources",
              })
                .filter(([key]) => scopes?.includes(key))
                .map(([, value], index) => (
                  <li key={index} className="py-1 text-muted-foreground">
                    {value}
                  </li>
                ))}
            </ul>

            <Field orientation={"horizontal"} className="grow w-full">
              <Button
                variant={"outline"}
                className={"grow"}
                onClick={() => {
                  if (redirectUri)
                    window.location.href = new URL(redirectUri).origin;
                }}
              >
                {t("Cancel")}
              </Button>
              <Button className={"grow"} onClick={() => consentAction()}>
                {t("Authorize")}
              </Button>
            </Field>
          </CardContent>
          <CardFooter>
            <FieldDescription className="text-center text-xs">
              <Trans i18nKey={"agreement"}>
                By authorize the access, you also agree with our third-party
                apps{" "}
                {/* <a href={client?.tos_uri} className="text-primary">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href={client?.policy_uri} className="text-primary">
                  Privacy Policy
                </a> */}
                .
              </Trans>
            </FieldDescription>
          </CardFooter>
        </Card>

        <FieldDescription className="px-6 text-center">
          <Trans i18nKey={"useAnotherAccount"}>
            Not you?{" "}
            <Link
              to="/login"
              viewTransition
              className="text-primary no-underline!"
            >
              Use another account
            </Link>
          </Trans>
        </FieldDescription>
      </div>
    </FormWrapper>
  );
}
export default Consent;
