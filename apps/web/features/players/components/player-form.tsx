"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createPlayerAction } from "../actions";
import { DEFAULT_FORM_VALUES } from "../constants";
import { CreatePlayerDto, CreatePlayerSchema } from "@repo/core";
import { PhysicalAttributes, BasicInfo, TeamInfo, PlayerStatus } from "./form";

export function PlayerForm() {
  const t = useTranslations("Players");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreatePlayerDto>({
    resolver: zodResolver(CreatePlayerSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const onSubmit = async (data: CreatePlayerDto) => {
    startTransition(async () => {
      try {
        await createPlayerAction(data);
        toast.success(t("playerAdded"));
        form.reset();
        router.push("/dashboard/players");
      } catch (error) {
        console.error("Failed to create player:", error);
        toast.error(t("failedToCreate"));
      }
    });
  };

  const onCancel = () => {
    router.push("/dashboard/players");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("addPlayer")}</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfo />
            <PhysicalAttributes />
            <TeamInfo />
            <PlayerStatus />

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("save") : t("addPlayer")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
