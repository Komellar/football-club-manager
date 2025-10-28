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
import {
  UpdateContractDto,
  UpdateContractSchema,
  ContractResponseDto,
} from "@repo/core";
import { ContractBasicInfo, ContractFinancialInfo, ContractDates } from "./";
import { updateContractAction } from "../../actions/contract-actions";
import { transformToFormValues } from "../../utils";

interface ContractEditFormProps {
  contract: ContractResponseDto;
}

export function ContractEditForm({ contract }: ContractEditFormProps) {
  const t = useTranslations("Contracts");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateContractDto>({
    resolver: zodResolver(UpdateContractSchema),
    defaultValues: transformToFormValues(contract),
  });

  const onSubmit = async (data: UpdateContractDto) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await updateContractAction(contract.id, data);
        toast.success(t("contractUpdated"));
        form.reset();
        router.push(`/contracts/${contract.id}`);
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
    router.push(`/contracts/${contract.id}`);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{t("editContract")}</CardTitle>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ContractBasicInfo
              disablePlayerSelect={true}
              player={contract.player}
            />
            <ContractDates />
            <ContractFinancialInfo />

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
