import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { getContracts } from "@/features/contracts/api";
import { getTranslations } from "next-intl/server";
import { ContractListSchema } from "@repo/core";
import { parseSearchParams } from "@/utils/searchParams";
import { Contracts } from "@/features/contracts/components/table/contracts";
import { ExpiringContractsServer } from "@/features/contracts/components/expiring-contracts";
import { Suspense } from "react";

// Force this page to be dynamic since it fetches authenticated data
export const dynamic = "force-dynamic";

export default async function ContractsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Contracts");

  const resolvedSearchParams = await searchParams;
  const parsed = parseSearchParams(resolvedSearchParams);

  const validatedParams = ContractListSchema.parse(parsed);

  const contracts = await getContracts(validatedParams);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("manageContracts")}</p>
        </div>
        <Link href={`/${locale}/contracts/new`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            {t("createContract")}
          </Button>
        </Link>
      </div>

      <Suspense fallback={<ExpiringContractsSkeleton />}>
        <ExpiringContractsServer days={360} />
      </Suspense>

      <Contracts data={contracts} />
    </div>
  );
}

function ExpiringContractsSkeleton() {
  return (
    <div className="border border-amber-200 bg-amber-50/50 rounded-lg p-6">
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    </div>
  );
}
