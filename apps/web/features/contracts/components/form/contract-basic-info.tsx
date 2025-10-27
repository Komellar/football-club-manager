"use client";

import { use } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { CreateContractDto, PlayerResponseDto } from "@repo/core";
import {
  CONTRACT_TYPE_OPTIONS,
  CONTRACT_STATUS_OPTIONS,
} from "../../constants";
import { useTranslations } from "next-intl";

interface ContractBasicInfoProps {
  disablePlayerSelect?: boolean;
  playersPromise?: Promise<{ data: PlayerResponseDto[] }>;
  player?: PlayerResponseDto;
}

export function ContractBasicInfo({
  disablePlayerSelect = false,
  playersPromise,
  player,
}: ContractBasicInfoProps) {
  const { control } = useFormContext<CreateContractDto>();

  const t = useTranslations("Contracts");

  const players = playersPromise ? use(playersPromise).data : [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.basicInfo")}</h3>

      <FormField
        control={control}
        name="playerId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {t("player")} {t("labels.required")}
            </FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number(value))}
              disabled={disablePlayerSelect}
              value={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={t("placeholders.selectPlayer")}>
                    {disablePlayerSelect ? player?.name : undefined}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {players?.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                    {p.jerseyNumber && ` #${p.jerseyNumber}`}
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
          name="contractType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("contractType")} {t("labels.required")}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t("placeholders.selectContractType")}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTRACT_TYPE_OPTIONS.map((option) => (
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

        <FormField
          control={control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("status")} {t("labels.required")}
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t("placeholders.selectStatus")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTRACT_STATUS_OPTIONS.map((option) => (
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
