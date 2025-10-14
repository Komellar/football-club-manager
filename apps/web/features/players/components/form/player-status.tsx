"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useFormContext } from "react-hook-form";
import { CreatePlayerDto } from "@repo/core";
import { useTranslations } from "next-intl";

export function PlayerStatus() {
  const { control } = useFormContext<CreatePlayerDto>();
  const t = useTranslations("Players");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.playerStatus")}</h3>

      <FormField
        control={control}
        name="isActive"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">
                {t("statusValues.active")} Player
              </FormLabel>
              <FormDescription>
                {t("descriptions.activePlayerStatus")}
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
