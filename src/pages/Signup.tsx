import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import React, { useId } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";
import { Link, useNavigate, useSearchParams } from "react-router";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth";
import {
  checkStrength,
  cn,
  getStrengthColor,
  getStrengthText,
  isValidEmail,
} from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThunderSDK } from "thunder-sdk";
import { useMyPolicies } from "@/hooks/useMyPolicies";

const Form = {
  fname: "",
  lname: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function Signup() {
  const id = useId();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { myPolicies, isLoading } = useMyPolicies();

  const accountId = searchParams.get("account");

  const [showPassword, setShowPassword] = React.useState(false);

  const BaseForm = { ...Form, ...(accountId ? { role: "" } : {}) };

  const { control, register, handleSubmit, formState, watch } = useForm<
    typeof BaseForm
  >({
    defaultValues: BaseForm,
  });

  const password = watch("password");

  const onSubmit: SubmitHandler<typeof BaseForm> = async (data) => {
    const Response = await authClient.signUp.email({
      name: [data.fname, data?.lname].filter(Boolean).join(" "),
      email: data.email,
      password: data.password,
    });

    if (Response.error === null) {
      // handling invite case
      if (accountId && Response.data.user.id && data.role) {
        // create invite for incoming account
        const { _id } = await ThunderSDK.accountInvites.create({
          body: {
            email: data.email,
            role: data.role,
          },
          axiosConfig: {
            headers: {
              "X-ACCOUNT-ID": accountId,
            },
          },
        });
        if (_id) {
          // accept invite for that account
          await ThunderSDK.accountMembers.create({
            body: {
              invite: Response.data.user.id,
            },
          });
          // close open browser here
        }
      } else {
        navigate("/");
      }
    } else toast.error(Response.error.message);
  };

  const strength = checkStrength(password);

  const strengthScore = React.useMemo(() => {
    return strength.filter((req) => req.met).length;
  }, [strength]);

  return (
    <FormWrapper title={t("Signup")}>
      <Card>
        <CardHeader>
          <CardTitle>{t("Create an account")}</CardTitle>
          <CardDescription>
            {t("Enter your information below to create your account")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field orientation={"horizontal"}>
                <Field>
                  <FieldLabel htmlFor="fname">{t("First Name")}</FieldLabel>
                  <Input
                    id="fname"
                    type="text"
                    placeholder="John"
                    {...register("fname", {
                      required: t("First name is required!"),
                    })}
                  />

                  <FieldError>{formState.errors.fname?.message}</FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="lname">{t("Last Name")}</FieldLabel>
                  <Input
                    id="lname"
                    type="text"
                    placeholder="Doe"
                    {...register("lname")}
                  />
                </Field>
              </Field>
              {accountId && (
                <Field>
                  <FieldLabel htmlFor="role">{t("Role")}</FieldLabel>
                  <Controller
                    name="role"
                    control={control}
                    rules={{
                      required: t("Role is required"),
                    }}
                    render={({ field }) => (
                      <Select
                        id="role"
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={isLoading} // disabling while fetching data
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("Select role")}
                            className="capitalize"
                          />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            {myPolicies?.subRoles?.map((role, idx) => (
                              <SelectItem
                                key={idx}
                                value={role}
                                className="capitalize"
                              >
                                {role}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError>{formState.errors.role?.message}</FieldError>
                </Field>
              )}
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
                  {t(
                    "We'll use this to contact you. We will not share your email with anyone else.",
                  )}
                </FieldDescription>

                <FieldError>{formState.errors.email?.message}</FieldError>
              </Field>
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
                    className={cn(
                      `h-full transition-all duration-500 ease-out`,
                      getStrengthColor(strengthScore),
                    )}
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
              <FieldGroup>
                <Field>
                  <Button type="submit">
                    {formState.isSubmitting && <Spinner />}
                    {t("Create Account")}
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    {!accountId && (
                      <Trans i18nKey={"accountExist"}>
                        Already have an account? <Link to="/">Sign in</Link>
                      </Trans>
                    )}
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

export default Signup;
