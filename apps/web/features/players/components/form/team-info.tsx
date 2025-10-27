import { useFormContext } from "react-hook-form";
import { CreatePlayerDto } from "@repo/core";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/shared/form";
import { useTranslations } from "next-intl";

export function TeamInfo() {
  const { control } = useFormContext<CreatePlayerDto>();
  const t = useTranslations("Players");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.teamInfo")}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="jerseyNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("jerseyNumber")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder={t("placeholders.enterJerseyNumber")}
                  onValueChange={field.onChange}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t("descriptions.jerseyNumberRange")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="marketValue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("marketValue")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder={t("placeholders.enterMarketValue")}
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
        name="imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("profileImage")} {t("labels.optional")}
            </FormLabel>
            <FormControl>
              <Input
                type="url"
                placeholder="https://example.com/player-photo.jpg"
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
