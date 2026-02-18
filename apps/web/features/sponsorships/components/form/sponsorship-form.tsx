"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { createSponsorshipAction } from "../../actions/sponsorship-actions";
import { DEFAULT_SPONSORSHIP_FORM_VALUES } from "../../constants/form-constants";
import { CreateSponsorshipDto, CreateSponsorshipSchema } from "@repo/core";
import {
  BasicInfo,
  DurationInfo,
  FinancialInfo,
  ContactInfo,
  AdditionalDetails,
} from ".";

export function SponsorshipForm() {
  const t = useTranslations("Sponsorships");

  const router = useRouter();
  const { locale } = useParams();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<CreateSponsorshipDto>({
    resolver: zodResolver(CreateSponsorshipSchema),
    defaultValues: DEFAULT_SPONSORSHIP_FORM_VALUES,
  });

  const onSubmit = async (data: CreateSponsorshipDto) => {
    setServerError(null);
    startTransition(async () => {
      try {
        const result = await createSponsorshipAction(data);
        toast.success(t("sponsorshipCreated"));
        form.reset();
        router.push(`/${locale}/sponsorships/${result.id}`);
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
    router.push(`/${locale}/sponsorships`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("addSponsorship")}</CardTitle>
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
            <DurationInfo />
            <FinancialInfo />
            <ContactInfo />
            <AdditionalDetails />

            <div className="flex justify-end space-x-4 pt-6">
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? t("saving") : t("addSponsorship")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
