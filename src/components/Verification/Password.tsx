import { authClient } from "@/lib/auth";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel } from "../ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const DefaultForm = {
  password: "",
};

function PasswordVerification() {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = React.useState(false);

  const { register, handleSubmit, reset } = useForm<typeof DefaultForm>({
    defaultValues: DefaultForm,
  });

  const onSubmit = async (formData: typeof DefaultForm) => {
    const { error } = await authClient.twoFactor.disable(formData);

    if (error) {
      toast.error(error.message);
      return;
    }

    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">{t("Password")}</FieldLabel>
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
      </FieldGroup>

      <Button type="submit">{t("Submit")}</Button>
    </form>
  );
}

export default PasswordVerification;
