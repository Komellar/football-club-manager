import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getSponsorships } from "@/features/sponsorships/api";
import { SponsorshipsTable } from "@/features/sponsorships/components/table/sponsorships-table";
import { getTranslations } from "next-intl/server";
import { SponsorshipListSchema } from "@repo/core";
import { parseSearchParams } from "@/utils/searchParams";
import { Card, CardContent } from "@/components/ui/card";

// Force this page to be dynamic since it fetches authenticated data
export const dynamic = "force-dynamic";

export default async function SponsorshipsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Sponsorships");

  const resolvedSearchParams = await searchParams;
  const parsed = parseSearchParams(resolvedSearchParams);

  const validatedParams = SponsorshipListSchema.parse(parsed);

  const sponsorships = await getSponsorships(validatedParams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("manageSponsorships")}</p>
        </div>
        <Link href={`/${locale}/sponsorships/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addSponsorship")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <SponsorshipsTable sponsorshipsData={sponsorships} />
        </CardContent>
      </Card>
    </div>
  );
}
