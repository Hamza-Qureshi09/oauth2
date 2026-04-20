import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ThunderSDK } from "thunder-sdk";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router";
import { isValidEmail } from "@/lib/utils";
import { useMyPolicies } from "@/hooks/useMyPolicies";

const DefaultForm: Parameters<
  typeof ThunderSDK.accountInvites.create
>[number]["body"] = {
  email: "",
  role: "",
  url: "",
};

export const CreateInvite = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { myPolicies, isLoading } = useMyPolicies();

  const { control, register, handleSubmit, reset, formState } = useForm<
    typeof DefaultForm
  >({
    defaultValues: DefaultForm,
  });

  const onSubmit = async (formData: typeof DefaultForm) => {
    try {
      const { _id } = await ThunderSDK.accountInvites.create({
        body: {
          email: formData.email,
          role: formData.role,
          url: new URL(`invite/{{_id}}`, window.location.origin).toString(),
        },
        axiosConfig: {
          headers: {
            "X-ACCOUNT-ID": searchParams.get("account"),
          },
        },
      });

      if (_id) {
        reset(DefaultForm);
        onSuccess?.();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-lg mx-auto px-3"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="recipient" className="text-base">
            {t("Invite Member")}
            <Info className="size-4" />
          </FieldLabel>
          <Field orientation={"horizontal"}>
            <InputGroup>
              <InputGroupInput
                type="email"
                placeholder={t("Email")}
                className="flex-1"
                {...register("email", {
                  validate: (value) =>
                    isValidEmail(value)
                      ? true
                      : t("Please provide a valid email!"),
                })}
              />

              <InputGroupAddon align="inline-end">
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
                      <SelectTrigger size={"xs"} className={"min-w-0"}>
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
              </InputGroupAddon>
            </InputGroup>
            <Field className="w-32">
              <Button type="submit" disabled={formState.isSubmitting}>
                {formState.isSubmitting && <Spinner />}
                {t("Send Invite")}
              </Button>
            </Field>
          </Field>

          <FieldError>
            {formState.errors.email
              ? formState.errors.email?.message
              : formState.errors.role?.message}
          </FieldError>
        </Field>
      </FieldGroup>
    </form>
  );
};
