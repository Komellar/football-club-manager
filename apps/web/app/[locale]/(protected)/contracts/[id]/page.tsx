import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContractDetails,
  DeleteContractDialog,
} from "@/features/contracts/components";
import { getContractById } from "@/features/contracts/api/contracts";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ContractDetailsPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function ContractDetailsPage({
  params,
}: ContractDetailsPageProps) {
  const { locale, id } = await params;
  const contractId = Number(id);

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/contracts`}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {t("contractDetails")}
            </h1>
            {contract.player && (
              <p className="text-muted-foreground">
                {t("contractFor", { player: contract.player.name })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/${locale}/contracts/${contractId}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              {t("edit")}
            </Button>
          </Link>
          <DeleteContractDialog
            contractId={contractId}
            playerName={contract.player?.name}
          />
        </div>
      </div>

      <Suspense fallback={<ContractDetailsSkeleton />}>
        <ContractDetails contract={contract} />
      </Suspense>
    </div>
  );
}

function ContractDetailsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
