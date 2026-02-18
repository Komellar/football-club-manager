import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { CreateSponsorshipDto } from "@repo/core";
import { useTranslations } from "next-intl";
import {
  SPONSORSHIP_TYPE_OPTIONS,
  SPONSORSHIP_STATUS_OPTIONS,
} from "../../constants";

export function BasicInfo() {
  const { control } = useFormContext<CreateSponsorshipDto>();
  const t = useTranslations("Sponsorships");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.basicInfo")}</h3>

      {/* Sponsor Name */}
      <FormField
        control={control}
        name="sponsorName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("sponsorName")} {t("labels.required")}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t("placeholders.sponsorName")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sponsorship Type */}
      <FormField
        control={control}
        name="sponsorshipType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("type")} {t("labels.required")}
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.selectType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SPONSORSHIP_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Sponsorship Status */}
      <FormField
        control={control}
        name="sponsorshipStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("status")} {t("labels.required")}
            </FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.selectStatus")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SPONSORSHIP_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
