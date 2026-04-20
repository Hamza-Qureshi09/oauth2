import { type SubmitHandler, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth";
import { isValidEmail } from "@/lib/utils";

const DefaultForm = {
  email: "",
};

function ResetPassword() {
  const { t } = useTranslation();

  const { register, handleSubmit, formState } = useForm<typeof DefaultForm>({
    defaultValues: DefaultForm,
  });

  const onSubmit: SubmitHandler<typeof DefaultForm> = async (formData) => {
    const { data, error } = await authClient.requestPasswordReset({
      email: formData.email,
      redirectTo:
        window.location.origin + "/change-password" + window.location.search,
    });

    if (error) {
      toast.error(error.message);
      return;
    } else toast.success(t(data.message));
  };

  return (
    <FormWrapper title={t("Reset password")}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("Reset password")}</CardTitle>
          <CardDescription>
            {t("Enter your information below to submit the request")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email", {
                    validate: (value) =>
                      isValidEmail(value)
                        ? true
                        : t("Please provide a valid email!"),
                  })}
                />
                <FieldDescription>
                  {t("We'll use this email to recover your account.")}
                </FieldDescription>

                <FieldError>{formState.errors.email?.message}</FieldError>
              </Field>

              <FieldGroup>
                <Field>
                  <Button type="submit">
                    {formState.isSubmitting && <Spinner />}
                    {t("Submit request")}
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    <Trans i18nKey={"goBackToSignIn"}>
                      Go back to{" "}
                      <Link to="/" viewTransition>
                        Sign in
                      </Link>
                    </Trans>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </FormWrapper>
  );
}

export default ResetPassword;
