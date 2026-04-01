import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth";
import { isValidEmail } from "@/lib/utils";
import { useLocation, useSearchParams } from "react-router";

const DefaultForm = {
  email: "",
};

function MagicLinkForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams(location.search);

  const { handleSubmit, formState, control, reset } = useForm<
    typeof DefaultForm
  >({
    defaultValues: { ...DefaultForm, email: searchParams.get("email") ?? "" },
  });

  const onSubmit: SubmitHandler<typeof DefaultForm> = async (data) => {
    const Response = await authClient.signIn.magicLink({
      email: data.email,
      callbackURL: window.location.origin,
    });

    if (Response.error) toast.error(Response.error.message);
    else {
      reset({ email: "" });
      toast.success(t("A Magic Link has been sent to your mailbox!"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{t("Email")}</FieldLabel>
          <Controller
            name="email"
            control={control}
            rules={{
              validate: (value) =>
                isValidEmail(value) ? true : t("Please provide a valid email!"),
            }}
            render={({ field }) => (
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                autoComplete="email webauthn"
                value={field.value}
                onChange={(e) => {
                  const value = e.target.value;
                  // set email to url as well
                  searchParams.set("email", value);
                  setSearchParams(searchParams, { replace: true });
                  // update the form value
                  field.onChange(value);
                }}
              />
            )}
          />

          <FieldError>{formState.errors.email?.message}</FieldError>
        </Field>
        <Field>
          <Button type="submit">
            {formState.isSubmitting && <Spinner />}
            {t("Login")}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export default MagicLinkForm;
