"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { CreateTransferDto, TransferDirection } from "@repo/core";
import { Calendar } from "@/components/ui/calendar";
import { useTranslations } from "next-intl";
import { TRANSFER_STATUS_OPTIONS } from "../../constants/form-constants";
import { SearchableSelect } from "@/components/shared/form";
import {
  getAvailableTransferTypes,
  getPlayerOptions,
} from "../../utils/transfer-form-utils";

interface BasicTransferInfoProps {
  players?: Array<{ id: number; name: string }>;
  isEditMode?: boolean;
}

export function BasicTransferInfo({
  players = [],
  isEditMode = false,
}: BasicTransferInfoProps) {
  const { control, watch, setValue } = useFormContext<CreateTransferDto>();
  const t = useTranslations("Transfers");

  const transferDirection = watch("transferDirection");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.basicInfo")}</h3>

      <FormField
        control={control}
        name="playerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("player")} <span className="text-destructive">*</span>
            </FormLabel>
            <SearchableSelect
              options={getPlayerOptions(players)}
              value={field.value?.toString()}
              onValueChange={(value) => field.onChange(Number(value))}
              placeholder={t("placeholders.selectPlayer")}
              disabled={isEditMode}
            />
            {isEditMode && (
              <FormDescription>
                {t("descriptions.playerCannotBeChanged")}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="transferDirection"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("direction")} <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                // Reset transfer type when direction changes
                setValue("transferType", undefined as any);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("placeholders.selectDirection")}
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={TransferDirection.INCOMING}>
                  {t("directionValues.incoming")}
                </SelectItem>
                <SelectItem value={TransferDirection.OUTGOING}>
                  {t("directionValues.outgoing")}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="transferType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("type")} <span className="text-destructive">*</span>
            </FormLabel>
            <Select
              onValueChange={field.onChange}
              value={field.value}
              disabled={!transferDirection}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.selectType")} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {getAvailableTransferTypes(transferDirection).map((option) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          control={control}
          name="transferDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {t("date")} <span className="text-destructive">*</span>
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
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="transferStatus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("status")} <span className="text-destructive">*</span>
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.selectStatus")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRANSFER_STATUS_OPTIONS.map((option) => (
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

      <FormField
        control={control}
        name="otherClubName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{t("club")}</FormLabel>
            <FormControl>
              <Input
                placeholder={t("placeholders.enterClubName")}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>{t("descriptions.otherClubName")}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
