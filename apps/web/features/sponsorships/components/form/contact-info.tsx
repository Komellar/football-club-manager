import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { CreateSponsorshipDto } from "@repo/core";
import { useTranslations } from "next-intl";

export function ContactInfo() {
  const { control } = useFormContext<CreateSponsorshipDto>();
  const t = useTranslations("Sponsorships");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("contactInformation")}</h3>

      <FormField
        control={control}
        name="contactPerson"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("contactPerson")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("placeholders.contactPerson")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="contactEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contactEmail")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("placeholders.contactEmail")}
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
          name="contactPhone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("contactPhone")}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t("placeholders.contactPhone")}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
