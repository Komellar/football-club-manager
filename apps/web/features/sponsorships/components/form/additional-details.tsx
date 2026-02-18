import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { CreateSponsorshipDto } from "@repo/core";
import { useTranslations } from "next-intl";

export function AdditionalDetails() {
  const { control } = useFormContext<CreateSponsorshipDto>();
  const t = useTranslations("Sponsorships");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.additionalDetails")}</h3>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("description")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("placeholders.description")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("notes")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("placeholders.notes")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
