"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { updatePlayerAction } from "../../actions";
import { transformToFormValues } from "../../utils";
import {
  PlayerResponseDto,
  CreatePlayerSchema,
  CreatePlayerDto,
} from "@repo/core";
import { PhysicalAttributes, BasicInfo, TeamInfo, PlayerStatus } from ".";

interface EditPlayerFormProps {
  player: PlayerResponseDto;
}

export function EditPlayerForm({ player }: EditPlayerFormProps) {
  const t = useTranslations("Players");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreatePlayerDto>({
    resolver: zodResolver(CreatePlayerSchema),
    defaultValues: transformToFormValues(player),
  });

  const onSubmit = async (data: CreatePlayerDto) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await updatePlayerAction(player.id, data);
        toast.success(t("playerUpdated"));
        router.push(`/players/${player.id}/details`);
      } catch (error) {
        let errorMessage = t("failedToUpdate");
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        setServerError(errorMessage);
        toast.error(t("failedToUpdate"));
      }
    });
  };

  const onCancel = () => {
    router.push("/players");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("editPlayer")}</CardTitle>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
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
                {isPending ? t("saving") : t("saveChanges")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
