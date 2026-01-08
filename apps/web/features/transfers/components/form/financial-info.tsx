"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useFormContext } from "react-hook-form";
import { CreateTransferDto } from "@repo/core";
import { useTranslations } from "next-intl";
import { NumericInput } from "@/components/shared/form";

export function FinancialInfo() {
  const { control } = useFormContext<CreateTransferDto>();
  const t = useTranslations("Transfers");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.financialInfo")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="transferFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("transferFee")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder={t("placeholders.enterTransferFee")}
                  onValueChange={field.onChange}
                  max={9999999999.99}
                  {...field}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>{t("descriptions.transferFee")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="agentFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("agentFee")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder={t("placeholders.enterAgentFee")}
                  onValueChange={field.onChange}
                  max={9999999999.99}
                  {...field}
                  value={field.value}
                />
              </FormControl>
              <FormDescription>{t("descriptions.agentFee")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
