import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { generateSecret } from "@/lib/utils";
import { XCircleIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ThunderSDK } from "thunder-sdk";
import SaveClientSecret from "./SaveClientSecret";
import React from "react";

const abc = ThunderSDK.oauthClients.create;

const DefaultForm: Parameters<typeof abc>[number]["body"] = {
  type: "public",
  name: "",
  secret: "",
  redirectUris: [],
  allowedScopes: [],
};

const scopes: Record<string, string> = {
  offline_access: "Offline Access",
};

function CreateClient({
  data,
  render,
  onSuccess,
}: {
  data?: typeof DefaultForm & { _id: string };
  render?: React.ComponentProps<typeof DialogTrigger>["render"];
  onSuccess?: () => void;
}) {
  const { t } = useTranslation();
  const [clientSecret, setClientSecret] = React.useState<string>();

  const { control, register, handleSubmit, setValue, formState, reset } =
    useForm<typeof DefaultForm>({
      defaultValues: DefaultForm,
      values: data,
    });

  const values = Object.keys(scopes);

  function renderValue(value: (keyof typeof scopes)[]) {
    if (value.length === 0) {
      return "Select scopes";
    }
    const firstScope = value[0] ? scopes[value[0]] : "";
    const additionalScopes = value.length > 1
      ? ` (+${value.length - 1} more)`
      : "";
    return firstScope + additionalScopes;
  }

  const onSubmit = async (formData: typeof DefaultForm) => {
    try {
      if (data) {
        await ThunderSDK.oauthClients.update({
          body: formData,
          params: { id: data._id },
        });

        onSuccess?.();
        return;
      }

      await ThunderSDK.oauthClients.create({
        body: formData,
      });

      if (formData.type === "public") {
        reset();

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      } else if (formData.type === "confidential" && formData.secret) {
        setClientSecret(formData.secret);
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={render ??
          ((props) => (
            <Button variant={"secondary"} {...props}>
              {t("Create client")}
            </Button>
          ))}
      >
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{t("OAuth Client")}</DialogTitle>
          <DialogDescription>
            {t("Fill in the details for your OAuth client.")}
          </DialogDescription>
        </DialogHeader>
        <DialogPanel>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field orientation={"horizontal"}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      defaultValue={field.value}
                      onValueChange={(value) => {
                        if (value === "confidential") {
                          setValue("secret", generateSecret(40));
                        } else setValue("secret", undefined);

                        field.onChange(value);
                      }}
                      className={"flex md:flex-row"}
                    >
                      {[
                        {
                          title: "public",
                          description:
                            "For client-side apps that can't store secrets securely.",
                          value: "public",
                        },
                        {
                          title: "confidential",
                          description:
                            "For server-side apps that can securely store a client secret.",
                          value: "confidential",
                        },
                      ].map((v) => (
                        <Label
                          key={v.value}
                          className="flex items-start gap-2 rounded-lg border p-3 hover:bg-accent/50 has-data-checked:border-primary/48 has-data-checked:bg-accent/50"
                        >
                          <Radio value={v.value} />
                          <div className="flex flex-col gap-1">
                            <p className="capitalize">{v.title}</p>
                            <p className="text-muted-foreground text-xs">
                              {v.description}
                            </p>
                          </div>
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="fname">{t("Client Name")}</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder={t("e.g My Application")}
                  {...register("name", {
                    required: t("Client name is required!"),
                  })}
                />

                <FieldError>{formState.errors.name?.message}</FieldError>
              </Field>

              <Field>
                <FieldLabel htmlFor="allowedScopes">
                  {t("Allowed scopes")}
                </FieldLabel>
                <Controller
                  name="allowedScopes"
                  control={control}
                  rules={{
                    validate: (value) =>
                      value?.length === 0
                        ? t("At least one scope must be selected!")
                        : true,
                  }}
                  render={({ field }) => (
                    <Select
                      id="allowedScopes"
                      aria-label="Select scopes"
                      value={field.value}
                      onValueChange={field.onChange}
                      multiple
                    >
                      <SelectTrigger>
                        <SelectValue>{renderValue}</SelectValue>
                      </SelectTrigger>
                      <SelectPopup alignItemWithTrigger={false}>
                        {values.map((value) => (
                          <SelectItem key={value} value={value}>
                            {scopes[value]}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                  )}
                />
                <FieldError>
                  {formState.errors.allowedScopes?.message}
                </FieldError>
              </Field>

              <Field orientation={"horizontal"}>
                <Controller
                  name="redirectUris"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (!value || (value as string[]).length === 0) {
                        return t("At least one redirect URI is required!");
                      } else {
                        for (const uri of value as string[]) {
                          try {
                            new URL(uri);
                            return true;
                          } catch {
                            return t("Invalid URI: {{uri}}", { uri });
                          }
                        }
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => {
                    const fieldValue = (field.value ?? []) as string[];

                    const handleInput = (value: string) => {
                      if (value) field.onChange([...fieldValue, value]);
                    };

                    return (
                      <Field>
                        <FieldLabel htmlFor="redirectUris">
                          {t("Redirect URI")}
                        </FieldLabel>
                        <Input
                          id="redirectUris"
                          aria-label="Enter your domain"
                          type="text"
                          className="*:[input]:px-0!"
                          placeholder={"e.g https://myapp.com"}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleInput((e.target as HTMLInputElement).value);
                            }
                          }}
                          onBlur={(e) => handleInput(e.target.value)}
                        />

                        <FieldError>
                          {formState.errors.redirectUris?.message}
                        </FieldError>

                        {fieldValue.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {fieldValue.map((uri, index) => (
                              <Badge key={index} size="lg" variant={"outline"}>
                                {uri}{" "}
                                <span
                                  className="cursor-pointer"
                                  onClick={() => {
                                    field.onChange(
                                      fieldValue.filter((_, i) =>
                                        i !== index
                                      ),
                                    );
                                  }}
                                >
                                  <XCircleIcon className="fill-foreground stroke-background size-4" />
                                </span>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </Field>
                    );
                  }}
                />
              </Field>
            </FieldGroup>
          </form>
        </DialogPanel>
        <DialogFooter variant="bare">
          <Button
            variant={"secondary"}
            disabled={formState.isSubmitting || !formState.isDirty}
            onClick={handleSubmit(onSubmit)}
          >
            {formState.isSubmitting && <Spinner />}
            {t(data ? "Update" : "Submit")}
          </Button>

          {formState.isSubmitted && clientSecret
            ? <SaveClientSecret secret={clientSecret} onDone={reset} />
            : null}
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}

export default CreateClient;
