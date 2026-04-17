import { Button } from "@/components/ui/button";
import { BookCheck, CircleX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import useSWR from "swr";
import { ThunderSDK } from "thunder-sdk";

export const Invite = () => {
  const { token } = useParams<{ token: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useSWR(
    "accountMembers.create",
    async () =>
      await ThunderSDK.accountMembers.create({
        body: {
          invite: token,
        },
      }),
  );

  return (
    <div className="flex items-center justify-center min-h-svh bg-muted/30 p-4">
      <div className="bg-background border border-border/50 rounded-xl p-10 flex flex-col items-center gap-5 text-center max-w-sm w-full">
        {isLoading ? (
          <div className="flex flex-col gap-5 items-center justify-center h-full">
            <h5>{t("joining...")}</h5>
          </div>
        ) : data?._id ? (
          <>
            <div className="h-10 w-10 rounded-full bg-primary flex flex-col justify-center items-center">
              <BookCheck className="" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-base font-medium">{t("You're in!")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "You've successfully joined the account. Head to the accounts section to get started.",
                )}
              </p>
            </div>

            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                onClick={() => navigate("/", { replace: true })}
              >
                {t("Go to home")}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="h-10 w-10 rounded-full bg-red-700 flex flex-col justify-center items-center">
              <CircleX className="" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-base font-medium">{t("Failed to join")}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "We couldn't process your invitation. It may have expired or already been used.",
                )}
              </p>
            </div>

            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                onClick={() => navigate("/", { replace: true })}
              >
                {t("Go to home")}
              </Button>
              <Button variant="outline" className="flex-1">
                <a href="mailto:support@yourapp.com">{t("Contact support")}</a>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
