"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ContractsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Contracts");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-2xl font-bold">{t("errorLoading")}</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || t("errorMessage")}
      </p>
      <Button onClick={() => reset()}>{t("tryAgain")}</Button>
    </div>
  );
}
