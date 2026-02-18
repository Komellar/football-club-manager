import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { NumericInput } from "@/components/shared/form/input/numeric-input";
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
import { PAYMENT_FREQUENCY_OPTIONS } from "../../constants";

export function FinancialInfo() {
  const { control } = useFormContext<CreateSponsorshipDto>();
  const t = useTranslations("Sponsorships");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.financial")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="annualValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("annualValue")} {t("labels.required")}
              </FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="0.00"
                  value={field.value ?? null}
                  onValueChange={(val) => field.onChange(val ?? undefined)}
                  min={0}
                  max={500000000}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="paymentFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("paymentFrequency.label")}</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAYMENT_FREQUENCY_OPTIONS.map((option) => (
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
    </div>
  );
}
