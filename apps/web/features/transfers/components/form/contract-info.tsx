"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
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
import { CreateTransferDto } from "@repo/core";
import { Calendar } from "@/components/ui/calendar";
import { useTranslations } from "next-intl";

export function ContractInfo() {
  const { control, watch } = useFormContext<CreateTransferDto>();
  const t = useTranslations("Transfers");

  const transferType = watch("transferType");
  const isLoan = transferType === "loan";

  if (!isLoan) {
    return null;
  }

  const loanMaxEndDate = new Date();
  loanMaxEndDate.setFullYear(loanMaxEndDate.getFullYear() + 2);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.contractInfo")}</h3>

      <FormField
        control={control}
        name="loanEndDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>
              {t("loanEndDate")} <span className="text-destructive">*</span>
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
                      format(new Date(field.value), "PPP")
                    ) : (
                      <span>{t("placeholders.selectDate")}</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  defaultMonth={field.value}
                  captionLayout="dropdown"
                  endMonth={loanMaxEndDate}
                  startMonth={new Date("2020-01")}
                />
              </PopoverContent>
            </Popover>
            <FormDescription>{t("descriptions.loanEndDate")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
