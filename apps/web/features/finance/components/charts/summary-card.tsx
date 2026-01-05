import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FinancialSummary } from "@repo/core";
import { getTranslations } from "next-intl/server";
import { formatCurrency } from "@/utils/currency";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface SummaryCardProps {
  data: FinancialSummary;
}

export async function SummaryCard({ data }: SummaryCardProps) {
  const t = await getTranslations("Finance");

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{t("summary")}</CardTitle>
            <CardDescription className="text-base mt-1">
              {t("periodFinancialSummary")}
            </CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 p-3">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* Total Income */}
          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-green-500/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("totalIncome")}
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(data.totalIncome)}
                </p>
              </div>
              <div className="rounded-full bg-green-500/10 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
          </div>

          {/* Total Expenses */}
          <div className="group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-red-500/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("totalExpenses")}
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(data.totalExpenses)}
                </p>
              </div>
              <div className="rounded-full bg-red-500/10 p-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-red-500 to-rose-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
          </div>

          {/* Net Profit */}
          <div
            className={`group relative overflow-hidden rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md ${
              data.netProfit >= 0
                ? "hover:border-emerald-500/50"
                : "hover:border-orange-500/50"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("netProfit")}
                </p>
                <div className="flex items-baseline gap-2">
                  <p
                    className={`text-3xl font-bold ${
                      data.netProfit >= 0
                        ? "text-emerald-600"
                        : "text-orange-600"
                    }`}
                  >
                    {formatCurrency(data.netProfit)}
                  </p>
                </div>
              </div>
              <div
                className={`rounded-full p-2 ${
                  data.netProfit >= 0 ? "bg-emerald-500/10" : "bg-orange-500/10"
                }`}
              >
                {data.netProfit >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-orange-600" />
                )}
              </div>
            </div>
            <div
              className={`absolute bottom-0 left-0 h-1 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform ${
                data.netProfit >= 0
                  ? "bg-gradient-to-r from-emerald-500 to-green-500"
                  : "bg-gradient-to-r from-orange-500 to-amber-500"
              }`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
