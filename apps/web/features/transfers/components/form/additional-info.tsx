"use client";

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
import { CreateTransferDto } from "@repo/core";
import { useTranslations } from "next-intl";

export function AdditionalInfo() {
  const { control } = useFormContext<CreateTransferDto>();
  const t = useTranslations("Transfers");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.additionalInfo")}</h3>

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("notes")}</FormLabel>
            <FormControl>
              <Textarea
                placeholder={t("placeholders.enterNotes")}
                className="min-h-[100px]"
                {...field}
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
