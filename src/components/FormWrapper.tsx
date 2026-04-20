import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import HurufLogo from "@/assets/huruf-logo.png";
import { useCapabilities } from "@/hooks/useCapabilities";
import { useAppBranding } from "@/hooks/useAppBranding";
import FormSkeleton from "./LoadingSkeleton";
import PoweredBy from "./PoweredBy";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

function FormWrapper({
  children,
  title,
  consentLogo,
}: {
  children: React.ReactNode;
  title: string;
  consentLogo?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { isLoading, app, error } = useAppBranding();
  const { isLoading: capLoading } = useCapabilities();

  const appName = app?.name ?? "Huruf Tech";
  const logo = app?.logo ?? HurufLogo;

  const loading = isLoading || capLoading;

  return (
    <div className="w-full h-full min-h-svh flex items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-3 px-3">
        <title>
          {loading
            ? t("Loading OAuth")
            : error?.message
              ? t("OAuth Crashed")
              : `${title} - ${app?.name}`}
        </title>

        <div className="flex items-center gap-3 self-center">
          {consentLogo}
          <Avatar className="rounded-xl size-16 bg-transparent">
            {loading ? (
              <Skeleton className="w-16 h-16" />
            ) : (
              <Link to="/" viewTransition>
                <AvatarImage src={logo} alt={appName} />
                <AvatarFallback>
                  <AvatarImage src={HurufLogo} alt={"Huruf tech"} />
                </AvatarFallback>
              </Link>
            )}
          </Avatar>
        </div>

        {loading ? <FormSkeleton /> : children}

        <PoweredBy />
      </div>
    </div>
  );
}

export default FormWrapper;
