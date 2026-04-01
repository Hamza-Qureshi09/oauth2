import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import React, { useId } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useSearchParams } from "react-router";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth";

const DefaultForm = {
  password: "",
  confirmPassword: "",
};

function ChangePassword() {
  const id = useId();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const Location = useLocation();

  const [searchParams] = useSearchParams(Location.search);

  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, formState, watch } = useForm<
    typeof DefaultForm
  >({
    defaultValues: DefaultForm,
  });

  const password = watch("password");

  const onSubmit: SubmitHandler<typeof DefaultForm> = async (data) => {
    const token = searchParams.get("token");
    if (token) {
      const Response = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (Response.error === null) navigate("/");
      else toast.error(Response.error.message);
    } else
      toast.error(
        t("We didn't found the token. please request forgot password again!"),
      );
  };

  const checkStrength = (pass: string) => {
    const requirements = [
      { regex: /.{8,}/, text: "At least 8 characters" },
      { regex: /[0-9]/, text: "At least 1 number" },
      { regex: /[a-z]/, text: "At least 1 lowercase letter" },
      { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    ];

    return requirements.map((req) => ({
      met: req.regex.test(pass),
      text: req.text,
    }));
  };

  const strength = checkStrength(password);

  const strengthScore = React.useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  const getStrengthColor = (score: number) => {
    if (score === 0) return "bg-border";
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score === 3) return "bg-amber-500";
    return "bg-emerald-500";
  };

  const getStrengthText = (score: number) => {
    if (score === 0) return "Enter a password";
    if (score <= 2) return "Weak password";
    if (score === 3) return "Medium password";
    return "Strong password";
  };

  return (
    <FormWrapper title={t("Change password")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("Change password")}</CardTitle>
          <CardDescription>
            {t("Enter a secure & unique password")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="password"
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

                <FieldError>{formState.errors.password?.message}</FieldError>
                <FieldDescription>
                  {t("Must be at least 8 characters long.")}
                </FieldDescription>

                <div
                  aria-label="Password strength"
                  aria-valuemax={4}
                  aria-valuemin={0}
                  aria-valuenow={strengthScore}
                  className="mt-3 mb-4 h-1 w-full overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  tabIndex={-1}
                >
                  <div
                    className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`}
                    style={{ width: `${(strengthScore / 4) * 100}%` }}
                  />
                </div>
                {/* Password strength description */}
                <p
                  className="mb-2 font-medium text-foreground text-sm"
                  id={`${id}-description`}
                >
                  {getStrengthText(strengthScore)}. {t("Must contain:")}
                </p>

                {/* Password requirements list */}
                <ul aria-label="Password requirements" className="space-y-1.5">
                  {strength.map((req) => (
                    <li className="flex items-center gap-2" key={req.text}>
                      {req.met ? (
                        <CheckIcon
                          aria-hidden="true"
                          className="text-emerald-500"
                          size={16}
                        />
                      ) : (
                        <XIcon
                          aria-hidden="true"
                          className="text-muted-foreground/80"
                          size={16}
                        />
                      )}
                      <span
                        className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
                      >
                        {req.text}
                        <span className="sr-only">
                          {req.met
                            ? " - Requirement met"
                            : " - Requirement not met"}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  {t("Confirm Password")}
                </FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    {...register("confirmPassword", {
                      validate: (val) =>
                        val !== password
                          ? t(
                              "Confirm password should match with your password!",
                            )
                          : true,
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

                <FieldError>
                  {formState.errors.confirmPassword?.message}
                </FieldError>

                <FieldDescription>
                  {t("Please confirm your password.")}
                </FieldDescription>
              </Field>
              <Button type="submit">
                {formState.isSubmitting && <Spinner />}
                {t("Change")}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </FormWrapper>
  );
}

export default ChangePassword;
