import { Button } from "@/components/ui/button";
import { SponsorshipForm } from "@/features/sponsorships/components/form/sponsorship-form";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function NewSponsorshipPage() {
  const t = await getTranslations("Sponsorships");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/sponsorships`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("addSponsorship")}
          </h1>
          <p className="text-muted-foreground">
            {t("addSponsorshipDescription")}
          </p>
        </div>
      </div>

      <SponsorshipForm />
    </div>
  );
}
