"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useState, useTransition, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  CreateContractDto,
  CreateContractSchema,
  PlayerResponseDto,
} from "@repo/core";
import { ContractBasicInfo, ContractFinancialInfo, ContractDates } from ".";
import { DEFAULT_CONTRACT_FORM_VALUES } from "../../constants";
import { createContractAction } from "../../actions";
import { Skeleton } from "@/components/ui/skeleton";

interface ContractFormProps {
  playerId?: number;
  playersPromise: Promise<{ data: PlayerResponseDto[] }>;
}

export function ContractForm({ playerId, playersPromise }: ContractFormProps) {
  const t = useTranslations("Contracts");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateContractDto>({
    resolver: zodResolver(CreateContractSchema),
    defaultValues: DEFAULT_CONTRACT_FORM_VALUES,
  });

  const onSubmit = async (data: CreateContractDto) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await createContractAction(data);
        toast.success(t("contractCreated"));
        form.reset();
        router.push(`/contracts/${result.id}`);
      } catch (error) {
        let errorMessage = t("failedToCreate");
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        setServerError(errorMessage);
        toast.error(t("failedToCreate"));
      }
    });
  };

  const onCancel = () => {
    if (playerId) {
      router.push(`/players/${playerId}`);
    } else {
      router.push("/contracts");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{t("createContract")}</CardTitle>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Suspense fallback={<ContractBasicInfoSkeleton />}>
              <ContractBasicInfo
                disablePlayerSelect={!!playerId}
                playersPromise={playersPromise}
              />
            </Suspense>
            <ContractDates />
            <ContractFinancialInfo />

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("saving") : t("createContract")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

function ContractBasicInfoSkeleton() {
  const t = useTranslations("Contracts");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t("sections.basicInfo")}</h3>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
