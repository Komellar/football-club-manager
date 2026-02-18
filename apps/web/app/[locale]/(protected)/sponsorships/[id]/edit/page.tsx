import { EditSponsorshipForm } from "@/features/sponsorships/components/form/edit-sponsorship-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSponsorshipById } from "@/features/sponsorships/api";
import { notFound } from "next/navigation";

export default async function EditSponsorshipPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("Sponsorships");

  const sponsorshipId = Number(id);
  if (isNaN(sponsorshipId)) {
    notFound();
  }

  const sponsorship = await getSponsorshipById(sponsorshipId);

  if (!sponsorship) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/sponsorships/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("editSponsorship")}
          </h1>
          <p className="text-muted-foreground">
            {t("editSponsorshipDescription")}
          </p>
        </div>
      </div>

      <EditSponsorshipForm sponsorship={sponsorship} />
    </div>
  );
}
