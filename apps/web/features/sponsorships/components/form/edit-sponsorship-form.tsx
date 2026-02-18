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
import { updateSponsorshipAction } from "../../actions/sponsorship-actions";
import { UpdateSponsorshipDto, UpdateSponsorshipSchema, SponsorshipResponseDto } from "@repo/core";
import { transformToFormValues } from "../../utils/sponsorship-form-utils";
import { BasicInfo } from "./basic-info";
import { DurationInfo } from "./duration-info";
import { FinancialInfo } from "./financial-info";
import { ContactInfo } from "./contact-info";
import { AdditionalDetails } from "./additional-details";

interface EditSponsorshipFormProps {
  sponsorship: SponsorshipResponseDto;
}

export function EditSponsorshipForm({ sponsorship }: EditSponsorshipFormProps) {
  const t = useTranslations("Sponsorships");

  const router = useRouter();
  const { locale } = useParams();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<UpdateSponsorshipDto>({
    resolver: zodResolver(UpdateSponsorshipSchema),
    defaultValues: transformToFormValues(sponsorship),
  });

  const onSubmit = async (data: UpdateSponsorshipDto) => {
    setServerError(null);
    startTransition(async () => {
      try {
        await updateSponsorshipAction(sponsorship.id, data);
        toast.success(t("sponsorshipUpdated"));
        router.push(`/${locale}/sponsorships/${sponsorship.id}`);
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
    router.push(`/${locale}/sponsorships/${sponsorship.id}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{t("editSponsorship")}</CardTitle>
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
                {isPending ? t("saving") : t("edit")}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
