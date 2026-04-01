import { EyeIcon, EyeOffIcon } from "lucide-react";
import React from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth";
import { isValidEmail } from "@/lib/utils";

const DefaultForm = {
  email: "",
  password: "",
  rememberMe: false,
};

function CredentialsForm() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(location.search);
  const [showPassword, setShowPassword] = React.useState(false);
  const { control, register, handleSubmit, formState } = useForm<
    typeof DefaultForm
  >({
    defaultValues: { ...DefaultForm, email: searchParams.get("email") ?? "" },
  });

  const onSubmit: SubmitHandler<typeof DefaultForm> = async (data) => {
    const Response = await authClient.signIn.email(
      {
        ...data,
      },
      {
        async onSuccess(context) {
          if (context.data.twoFactorRedirect) {
            // Handle the 2FA verification in place
          }
        },
      },
    );

    if (Response.error) toast.error(Response.error.message);

    navigate("/" + window.location.search);
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
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
            <Link to="reset-password">{t("Forgot your password?")}</Link>
          </div>
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
        <Controller
          name="rememberMe"
          control={control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <Checkbox
                id="rememberMe"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
              <Label htmlFor="rememberMe">{t("Remember me")}</Label>
            </Field>
          )}
        />
        <Button type="submit">
          {formState.isSubmitting && <Spinner />}
          {t("Login")}
        </Button>
      </FieldGroup>
    </form>
  );
}

export default CredentialsForm;
