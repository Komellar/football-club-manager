import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContractEditForm } from "@/features/contracts/components";
import { getContractById } from "@/features/contracts/api/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ContractEditPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function ContractEditPage({
  params,
}: ContractEditPageProps) {
  const { locale, id } = await params;
  const contractId = parseInt(id, 10);

  if (isNaN(contractId)) {
    notFound();
  }

  const t = await getTranslations("Contracts");

  const contract = await getContractById(contractId);

  if (!contract) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/contracts/${contractId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("editContract")}
          </h1>
          {contract.player && (
            <p className="text-muted-foreground">
              {t("editingContractFor", { player: contract.player.name })}
            </p>
          )}
        </div>
      </div>

      {/* Edit Form */}
      <Suspense fallback={<ContractEditFormSkeleton />}>
        <ContractEditForm contract={contract} />
      </Suspense>
    </div>
  );
}

function ContractEditFormSkeleton() {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardContent className="pt-6">
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex justify-end gap-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
