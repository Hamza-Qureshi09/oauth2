import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { Field, FieldGroup, FieldSeparator } from "./ui/field";
import { Skeleton } from "./ui/skeleton";

function FormSkeleton() {
  return (
    <div className={cn("flex flex-col gap-6")}>
      <Card className="relative">
        <div className="flex flex-col gap-2 items-center justify-center">
          <Skeleton className="w-30 h-7" />
          <Skeleton className="w-50 h-5" />
        </div>
        <CardContent>
          <form>
            <FieldGroup>
              <Field>
                <Skeleton className="w-50 h-8" />
                <Skeleton className="w-50 h-8" />
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                <Skeleton className="w-30 h-5" />
              </FieldSeparator>
              <Field>
                <Skeleton className="max-w-18 h-5" />
                <Skeleton className="w-full h-8" />
              </Field>
              <Field>
                <div className="flex justify-between items-center">
                  <Skeleton className="w-full max-w-18 h-5" />
                  <Skeleton className="w-full max-w-18 h-5" />
                </div>
                <Skeleton className="w-full h-8" />
              </Field>
              <Field>
                <Skeleton className="w-full h-8" />

                <Skeleton className="w-40 max-w-40 h-5 mx-auto" />
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <Skeleton className="w-50 max-w-50 h-5 mx-auto" />
    </div>
  );
}

export default FormSkeleton;
