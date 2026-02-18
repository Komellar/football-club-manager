import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteSponsorshipDialog } from "@/features/sponsorships/components/delete-sponsorship-dialog";
import { getSponsorshipById } from "@/features/sponsorships/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  formatSponsorshipType,
  formatSponsorshipStatus,
  getSponsorshipTypeColor,
  getSponsorshipStatusColor,
} from "@/features/sponsorships/utils";
import { formatCurrency } from "@/utils/currency";
import { dateToString } from "@/utils/date";

interface SponsorshipDetailsPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function SponsorshipDetailsPage({
  params,
}: SponsorshipDetailsPageProps) {
  const { locale, id } = await params;
  const sponsorshipId = Number(id);

  if (isNaN(sponsorshipId)) {
    notFound();
  }

  const t = await getTranslations("Sponsorships");

  const sponsorship = await getSponsorshipById(sponsorshipId);

  if (!sponsorship) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/sponsorships`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {sponsorship.sponsorName}
            </h1>
            <p className="text-muted-foreground">
              {formatSponsorshipType(sponsorship.sponsorshipType)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/sponsorships/${sponsorshipId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
          </Link>
          <DeleteSponsorshipDialog
            sponsorshipId={sponsorshipId}
            sponsorName={sponsorship.sponsorName}
            redirectPath={`/${locale}/sponsorships`}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("basicInformation")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t("type")}</p>
              <Badge
                variant="outline"
                className={getSponsorshipTypeColor(sponsorship.sponsorshipType)}
              >
                {formatSponsorshipType(sponsorship.sponsorshipType)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("status")}</p>
              <Badge
                variant="outline"
                className={getSponsorshipStatusColor(
                  sponsorship.sponsorshipStatus
                )}
              >
                {formatSponsorshipStatus(sponsorship.sponsorshipStatus)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("startDate")}</p>
              <p className="font-medium">
                {dateToString(sponsorship.startDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("endDate")}</p>
              <p className="font-medium">{dateToString(sponsorship.endDate)}</p>
            </div>
            {sponsorship.isActive && sponsorship.daysRemaining && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("daysRemaining")}
                </p>
                <p className="font-medium">{sponsorship.daysRemaining}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("financialInformation")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("annualValue")}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(sponsorship.annualValue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("paymentFrequency.label")}
              </p>
              <p className="font-medium">
                {t(`paymentFrequency.${sponsorship.paymentFrequency}`)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("monthlyValue")}
              </p>
              <p className="font-medium">
                {formatCurrency(sponsorship.monthlyValue)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {(sponsorship.contactPerson ||
          sponsorship.contactEmail ||
          sponsorship.contactPhone) && (
          <Card>
            <CardHeader>
              <CardTitle>{t("contactInformation")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sponsorship.contactPerson && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("contactPerson")}
                  </p>
                  <p className="font-medium">{sponsorship.contactPerson}</p>
                </div>
              )}
              {sponsorship.contactEmail && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("contactEmail")}
                  </p>
                  <p className="font-medium">{sponsorship.contactEmail}</p>
                </div>
              )}
              {sponsorship.contactPhone && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("contactPhone")}
                  </p>
                  <p className="font-medium">{sponsorship.contactPhone}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {sponsorship.description && (
          <Card>
            <CardHeader>
              <CardTitle>{t("description")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{sponsorship.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {sponsorship.notes && (
          <Card>
            <CardHeader>
              <CardTitle>{t("notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{sponsorship.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
