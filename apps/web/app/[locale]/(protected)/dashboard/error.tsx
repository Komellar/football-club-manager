"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorPageProps) {
  const t = useTranslations("Common");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Contract Financial Overview</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {t("errorOccurred")}
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="mb-4">
              <p className="text-muted-foreground mb-2">Failed to load</p>
              <p className="text-sm text-gray-500">
                {error.message || "An unexpected error occurred"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => reset()}>{t("tryAgain")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
