import { Button } from "@/components/ui/button";
import { ContractForm } from "@/features/contracts/components";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { getPlayers } from "@/features/players/api";

export default async function NewContractPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("Contracts");

  const playersPromise = getPlayers({ limit: 100 });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/players`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("createContract")}
          </h1>
          <p className="text-muted-foreground">
            {t("createContractDescription")}
          </p>
        </div>
      </div>

      <ContractForm playersPromise={playersPromise} />
    </div>
  );
}
