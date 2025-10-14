import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleNumericFieldChange } from "@/utils/form";
import { useFormContext } from "react-hook-form";
import { CreatePlayerDto } from "@repo/core";
import { NumericInput } from "@/components/shared/form";
import { useTranslations } from "next-intl";

export function PhysicalAttributes() {
  const { control } = useFormContext<CreatePlayerDto>();
  const t = useTranslations("Players");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t("sections.physicalAttributes")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("height")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder={t("placeholders.enterHeight")}
                  value={field.value}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("weight")}</FormLabel>
              <FormControl>
                <NumericInput
                  placeholder={t("placeholders.enterWeight")}
                  value={field.value}
                  onChange={(e) =>
                    handleNumericFieldChange(e.target.value, field.onChange)
                  }
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
