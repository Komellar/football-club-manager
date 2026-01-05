"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DateRangeSelectorProps {
  startDate: string;
  endDate: string;
}

export function DateRangeSelector({
  startDate,
  endDate,
}: DateRangeSelectorProps) {
  const t = useTranslations("Finance");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleDateSelect = (isStart: boolean, date: Date | undefined) => {
    if (date) {
      const params = new URLSearchParams(searchParams.toString());
      const dateStr = format(date, "yyyy-MM-dd");
      if (dateStr) {
        if (isStart) params.set("startDate", dateStr);
        else params.set("endDate", dateStr);

        router.push(`?${params.toString()}`);
      }
    }
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    handleDateSelect(true, date);
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    handleDateSelect(false, date);
  };

  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("selectDateRange")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t("startDate")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !startDateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDateObj ? (
                    format(startDateObj, "PPP")
                  ) : (
                    <span>{t("pickDate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDateObj}
                  onSelect={handleStartDateSelect}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{t("endDate")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !endDateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDateObj ? (
                    format(endDateObj, "PPP")
                  ) : (
                    <span>{t("pickDate")}</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDateObj}
                  onSelect={handleEndDateSelect}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
