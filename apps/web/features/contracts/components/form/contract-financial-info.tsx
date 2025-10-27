"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";
import { useFormContext } from "react-hook-form";
import { CreateContractDto } from "@repo/core";
import { useTranslations } from "next-intl";
import { NumericInput } from "@/components/shared/form";

export function ContractFinancialInfo() {
  const { control } = useFormContext<CreateContractDto>();
  const t = useTranslations("Contracts");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.financial")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("salary")} {t("labels.required")}
              </FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="0"
                  onValueChange={field.onChange}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("descriptions.monthlySalary")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="bonuses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("bonuses")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="0"
                  onValueChange={field.onChange}
                  {...field}
                />
              </FormControl>
              <FormDescription>{t("descriptions.bonuses")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="signOnFee"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("signOnFee")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="0"
                  onValueChange={field.onChange}
                  {...field}
                />
              </FormControl>
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
                  placeholder="0"
                  onValueChange={field.onChange}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="releaseClause"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("releaseClause")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder="0"
                  onValueChange={field.onChange}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

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
            <FormDescription>{t("descriptions.notes")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
