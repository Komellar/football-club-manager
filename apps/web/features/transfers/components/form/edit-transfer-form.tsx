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
import { updateTransferAction } from "../../actions";
import {
  UpdateTransferDto,
  UpdateTransferSchema,
  TransferResponseDto,
} from "@repo/core";
import {
  BasicTransferInfo,
  FinancialInfo,
  ContractInfo,
  AdditionalInfo,
} from ".";
import { transformToFormValues } from "../../utils/transfer-form-utils";

interface EditTransferFormProps {
  transfer: TransferResponseDto;
  players?: Array<{ id: number; name: string }>;
}

export function EditTransferForm({
  transfer,
  players = [],
}: EditTransferFormProps) {
  const t = useTranslations("Transfers");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(UpdateTransferSchema),
    defaultValues: transformToFormValues(transfer),
  });

  const onSubmit = async (data: UpdateTransferDto) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await updateTransferAction(transfer.id, data);
        toast.success(t("transferUpdated"));
        router.push(`/transfers/${transfer.id}`);
        router.refresh();
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
    router.push(`/transfers/${transfer.id}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("editTransfer")}</CardTitle>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicTransferInfo players={players} isEditMode={true} />
            <FinancialInfo />
            <ContractInfo />
            <AdditionalInfo />

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("saving") : t("edit")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
