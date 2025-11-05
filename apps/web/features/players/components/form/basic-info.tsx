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
import { SearchableSelect } from "@/components/shared/form";
import { NATIONALITY_OPTIONS, POSITION_OPTIONS } from "../../constants";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";
import { CreatePlayerDto } from "@repo/core";
import { Calendar } from "@/components/ui/calendar";
import { useTranslations } from "next-intl";

export function BasicInfo() {
  const { control } = useFormContext<CreatePlayerDto>();
  const t = useTranslations("Players");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.basicInfo")}</h3>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("playerName")} {t("labels.required")}
            </FormLabel>
            <FormControl>
              <Input
                placeholder={t("placeholders.enterPlayerName")}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("position")} {t("labels.required")}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("placeholders.selectPosition")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {POSITION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(`${option.labelKey}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {t("dateOfBirth")} {t("labels.required")}
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "dd-MM-yyyy")
                      ) : (
                        <span>{t("placeholders.selectDate")}</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1950-01-01")
                    }
                    defaultMonth={field.value}
                    captionLayout="dropdown"
                    startMonth={new Date("1975-01-01")}
                    endMonth={new Date("2009-12-31")}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("country")} {t("labels.required")}
            </FormLabel>
            <FormControl>
              <SearchableSelect
                options={NATIONALITY_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                placeholder={t("placeholders.selectCountry")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
