import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getTransfers } from "@/features/transfers/api";
import { TransfersTable } from "@/features/transfers/components";
import { getTranslations } from "next-intl/server";
import { TransferListSchema } from "@repo/core";
import { parseSearchParams } from "@/utils/searchParams";
import { Card, CardContent } from "@/components/ui/card";

// Force this page to be dynamic since it fetches authenticated data
export const dynamic = "force-dynamic";

// Accept searchParams for SSR hydration
export default async function TransfersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Transfers");

  const resolvedSearchParams = await searchParams;
  const parsed = parseSearchParams(resolvedSearchParams);

  const validatedParams = TransferListSchema.parse(parsed);

  const transfers = await getTransfers(validatedParams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("manageTransfers")}</p>
        </div>
        <Link href={`/${locale}/transfers/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("addTransfer")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent>
          <TransfersTable transfersData={transfers} />
        </CardContent>
      </Card>
    </div>
  );
}
