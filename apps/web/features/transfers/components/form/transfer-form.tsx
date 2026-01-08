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
import { createTransferAction } from "../../actions";
import { DEFAULT_TRANSFER_FORM_VALUES } from "../../constants/form-constants";
import { CreateTransferDto, CreateTransferSchema } from "@repo/core";
import {
  BasicTransferInfo,
  FinancialInfo,
  ContractInfo,
  AdditionalInfo,
} from ".";

interface TransferFormProps {
  players?: Array<{ id: number; name: string }>;
}

export function TransferForm({ players = [] }: TransferFormProps) {
  const t = useTranslations("Transfers");

  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<any>({
    resolver: zodResolver(CreateTransferSchema),
    defaultValues: {
      ...DEFAULT_TRANSFER_FORM_VALUES,
    },
  });

  const onSubmit = async (data: CreateTransferDto) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await createTransferAction(data);
        toast.success(t("transferCreated"));
        form.reset();
        router.push(`/transfers/${result.id}`);
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
    router.push("/transfers");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("addTransfer")}</CardTitle>
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicTransferInfo players={players} />
            <FinancialInfo />
            <ContractInfo />
            <AdditionalInfo />

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("saving") : t("addTransfer")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
